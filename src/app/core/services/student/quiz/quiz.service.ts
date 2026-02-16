import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { ApiClientService } from '../../../http/api-client.service';
import {
    Quiz,
    QuizAttempt,
    QuizQuestion,
    QuizAnswer,
    StartAttemptResponse,
    QuizResults,
    SubmitQuizRequest,
    ApiResponse,
    PaginatedResponse,
} from '../../../interfaces/student/quiz/quiz.interface';

/**
 * Service for student quiz operations based on documentation.
 */
@Injectable({ providedIn: 'root' })
export class StudentQuizService {
    private readonly BASE_PATH = '/studentquiz';

    // Current active attempt state
    private readonly _currentAttempt$ = new BehaviorSubject<StartAttemptResponse | null>(null);
    readonly currentAttempt$ = this._currentAttempt$.asObservable();

    constructor(private api: ApiClientService) { }

    private extractData(response: any, keys: string[] = []): any {
        if (!response) return null;
        if (response.data) return response.data;
        for (const key of keys) {
            if (response[key]) return response[key];
        }
        return response;
    }

    /**
     * Get all available quizzes for student.
     * GET /studentquiz/getAvailableQuizzes
     */
    getAvailableQuizzes(courseId?: string): Observable<Quiz[]> {
        let url = `${this.BASE_PATH}/getAvailableQuizzes`;
        if (courseId) {
            url += `?courseId=${courseId}`;
        }
        return this.api.get<any>(url).pipe(
            tap(response => console.log('Raw API response (quizzes):', response)),
            map(response => {
                const data = this.extractData(response, ['quizzes']);
                return Array.isArray(data) ? data : [];
            })
        );
    }

    /**
     * Get all quiz attempts for current user.
     * GET /studentquiz/getAttempts
     */
    getAttempts(filters?: { status?: string; courseId?: string; quizId?: string }): Observable<QuizAttempt[]> {
        let url = `${this.BASE_PATH}/getAttempts`;
        if (filters) {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
            const queryString = params.toString();
            if (queryString) url += `?${queryString}`;
        }

        return this.api.get<any>(url).pipe(
            map(response => {
                const data = this.extractData(response, ['attempts']);
                let attempts: QuizAttempt[] = [];
                if (Array.isArray(data)) attempts = data;
                else if (data?.items && Array.isArray(data.items)) attempts = data.items;

                // Normalize _id to attemptId and map nested quiz/course objects
                return attempts.map(a => {
                    const quizData = (a as any).quiz;
                    const courseData = (a as any).course;
                    const qId = (quizData && typeof quizData === 'object') ? quizData._id : quizData;
                    const cId = (courseData && typeof courseData === 'object') ? courseData._id : courseData;

                    return {
                        ...a,
                        attemptId: a.attemptId || (a as any)._id,
                        quizId: a.quizId || qId || '',
                        quizTitle: a.quizTitle || (quizData?.title) || 'Quiz',
                        courseId: a.courseId || cId || '',
                        courseTitle: a.courseTitle || (courseData?.courseTitle) || 'Course',
                        totalMarks: a.totalMarks || a.totalPoints || 0,
                        startTime: a.startTime || a.createdAt || new Date().toISOString()
                    } as QuizAttempt;
                });
            })
        );
    }

    /**
     * Start a new quiz attempt.
     * POST /studentquiz/startAttempt/:quizId
     */
    startAttempt(quizId: string): Observable<StartAttemptResponse> {
        return this.api.post<any>(
            `${this.BASE_PATH}/startAttempt/${quizId}`,
            {}
        ).pipe(
            tap(response => console.log('Start attempt raw response:', JSON.stringify(response))),
            map(response => {
                const data = this.extractData(response, ['attempt']);
                // If response itself has questions/quiz but extracted data doesn't, merge them
                if (response.questions && !data.questions) {
                    data.questions = response.questions;
                }
                // Also preserve quiz object if it's a sibling
                if (response.quiz && !data.quiz) {
                    data.quiz = response.quiz;
                }

                // Normalize IDs
                if (data) {
                    if (!data.attemptId && data._id) data.attemptId = data._id;
                    if (!data.quizId && data.quiz) data.quizId = typeof data.quiz === 'string' ? data.quiz : data.quiz._id;
                }
                return data;
            }),
            tap((data) => {
                console.log('Start attempt mapped/normalized data:', data);
                this._currentAttempt$.next(data);
            })
        );
    }

    /**
     * Submit quiz answers.
     * POST /studentquiz/submitQuiz/:attemptId
     */
    submitQuiz(attemptId: string, answers: QuizAnswer[]): Observable<any> {
        return this.api.post<any>(
            `${this.BASE_PATH}/submitQuiz/${attemptId}`,
            { answers }
        ).pipe(
            map(response => this.extractData(response, ['result'])),
            tap(() => {
                this._currentAttempt$.next(null);
            })
        );
    }

    /**
     * Get quiz results for an attempt.
     * GET /studentquiz/getResults/:attemptId
     */
    getResults(attemptId: string): Observable<QuizResults> {
        return this.api.get<any>(
            `${this.BASE_PATH}/getResults/${attemptId}`
        ).pipe(
            map(response => this.extractData(response, ['result']))
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Local State Management
    // ─────────────────────────────────────────────────────────────

    /**
     * Get current active attempt.
     */
    getCurrentAttempt(): StartAttemptResponse | null {
        return this._currentAttempt$.value;
    }

    /**
     * Clear current attempt state.
     */
    clearCurrentAttempt(): void {
        this._currentAttempt$.next(null);
    }

    /**
     * Check if there's an active attempt in progress.
     */
    hasActiveAttempt(): boolean {
        return this._currentAttempt$.value !== null;
    }
}


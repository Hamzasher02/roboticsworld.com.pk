// =======================================================
// ✅ FILE 2: core/services/teacher/quiz/quiz-api.service.ts
// (1 service me dashboard + quiz + summary sab)
// =======================================================

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../../environments/environment';

import {
  ApiResponse,
  AddQuestionRequest,
  CreateQuizRequest,
  InstructorQuizDashboardResponse,
  Quiz,
  QuizQuestion,
  QuizSummary,
  SetStatusRequest,
  UpdateQuizInfoRequest,
  UpdateSettingsRequest,
} from '../../../interfaces/teacher/quiz/quiz-api';

@Injectable({ providedIn: 'root' })
export class QuizApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/quiz`;

  private opts = { withCredentials: true as const };

  // ✅ dashboard
  getInstructorDashboard() {
    return this.http.get<InstructorQuizDashboardResponse>(
      `${this.base}/dashboard`,
      this.opts
    );
  }

  // ✅ quiz CRUD
  createQuiz(payload: CreateQuizRequest) {
    return this.http.post<ApiResponse<Quiz>>(
      `${this.base}/createQuiz`,
      payload,
      this.opts
    );
  }

  updateInfo(quizId: string, payload: UpdateQuizInfoRequest) {
    return this.http.patch<ApiResponse<Quiz>>(
      `${this.base}/updateInfo/${quizId}`,
      payload,
      this.opts
    );
  }

  addQuestion(quizId: string, payload: AddQuestionRequest) {
    return this.http.post<ApiResponse<QuizQuestion>>(
      `${this.base}/addQuestion/${quizId}`,
      payload,
      this.opts
    );
  }

  updateQuestion(quizId: string, questionId: string, payload: AddQuestionRequest) {
    return this.http.patch<ApiResponse<QuizQuestion>>(
      `${this.base}/updateQuestion/${quizId}/${questionId}`,
      payload,
      this.opts
    );
  }

  deleteQuestion(quizId: string, questionId: string) {
    return this.http.delete<ApiResponse<null>>(
      `${this.base}/deleteQuestion/${quizId}/${questionId}`,
      this.opts
    );
  }

  updateSettings(quizId: string, payload: UpdateSettingsRequest) {
    return this.http.patch<ApiResponse<Quiz>>(
      `${this.base}/updateSettings/${quizId}`,
      payload,
      this.opts
    );
  }

  // ✅ status
  setStatus(quizId: string, payload: SetStatusRequest) {
    return this.http.patch<ApiResponse<Quiz>>(
      `${this.base}/setStatus/${quizId}`,
      payload,
      this.opts
    );
  }

  // ✅ get quiz with questions
  getQuiz(quizId: string) {
    return this.http.get<ApiResponse<Quiz & { questions: QuizQuestion[] }>>(
      `${this.base}/getQuiz/${quizId}`,
      this.opts
    );
  }

  // ✅ list
  getMyQuizzes(params?: { status?: string; courseId?: string; page?: number; limit?: number }) {
    return this.http.get<ApiResponse<Quiz[]>>(`${this.base}/getMyQuizzes`, {
      ...this.opts,
      params: (params ?? {}) as any,
    });
  }

  // ✅ summary (typed)
  getSummary(quizId: string) {
    return this.http.get<ApiResponse<QuizSummary>>(
      `${this.base}/getSummary/${quizId}`,
      this.opts
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentQuizService } from '../../../../core/services/student/quiz/quiz.service';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
import { QuizResults } from '../../../../core/interfaces/student/quiz/quiz.interface';

@Component({
    selector: 'app-view-quiz-results',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './view-quiz-results.component.html',
    styleUrl: './view-quiz-results.component.css'
})
export class ViewQuizResultsComponent implements OnInit {
    results: QuizResults | null = null;
    loading = true;
    error = '';

    constructor(
        private route: ActivatedRoute,
        private quizService: StudentQuizService,
        private enrollmentService: EnrollmentService
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            const attemptId = params['attemptId'];
            if (attemptId) {
                this.loadResults(attemptId);
            } else {
                this.error = 'No attempt ID provided.';
                this.loading = false;
            }
        });
    }

    loadResults(attemptId: string): void {
        this.loading = true;
        this.quizService.getResults(attemptId).subscribe({
            next: (res) => {
                this.results = res;
                this.loading = false;

                // Check enrollment if needed (optional check)
                const courseId = this.results?.quiz?.course?._id;
                if (courseId) {
                    this.enrollmentService.checkEnrollmentStatus(courseId).subscribe();
                }
            },
            error: (err) => {
                console.error('Failed to load results:', err);
                this.error = 'Failed to load quiz results.';
                this.loading = false;
            }
        });
    }

    getOptionLetter(index: number): string {
        return String.fromCharCode(65 + index);
    }

    isUserSelected(item: any, optionId: string): boolean {
        return item.selectedOption === optionId;
    }

    isCorrectOption(item: any, optionId: string): boolean {
        // Handle both correctOption ID and options array check
        if (item.correctOption === optionId) return true;

        const option = item.options?.find((o: any) => o._id === optionId);
        return option?.isCorrect || false;
    }

    getScorePercentage(): number {
        if (!this.results || !this.results.totalPoints) return 0;
        return Math.round(((this.results.score || this.results.pointsObtained || 0) / this.results.totalPoints) * 100);
    }

    getPassedStatus(): boolean {
        if (!this.results) return false;
        return this.results.isPassed;
    }
}


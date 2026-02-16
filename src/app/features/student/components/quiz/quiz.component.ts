// student quiz component
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { StudentQuizService } from '../../../../core/services/student/quiz/quiz.service';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
import { Quiz, QuizAttempt } from '../../../../core/interfaces/student/quiz/quiz.interface';
import { Enrollment } from '../../../../core/interfaces/student/enrollments/enrollment.interface';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit, OnDestroy {
  availableQuizzes: Quiz[] = [];
  filteredQuizzes: Quiz[] = [];

  attempts: QuizAttempt[] = [];

  loadingQuizzes = false;
  loadingAttempts = false;

  errorQuizzes = '';
  errorAttempts = '';

  currentFilter = 'All Quizzes';
  searchQuery = '';

  courseId: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private quizService: StudentQuizService,
    private enrollmentService: EnrollmentService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.courseId = params['courseId'] || null;
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadData(): void {
    this.loadingQuizzes = true;
    this.errorQuizzes = '';

    const enrollmentSub = this.enrollmentService.getUserEnrollments().subscribe({
      next: (enrollments: Enrollment[]) => {
        const enrolledCourseIds = new Set(enrollments.map(e => (e.course as any)?._id).filter(id => !!id));

        const quizSub = this.quizService.getAvailableQuizzes(this.courseId || undefined).subscribe({
          next: (quizzes) => {
            this.availableQuizzes = quizzes.filter(quiz => {
              const quizCourseId = quiz.course?._id;
              return enrolledCourseIds.has(quizCourseId);
            });

            this.loadingQuizzes = false;
            this.applyFilters();
          },
          error: (err) => {
            this.errorQuizzes = 'Failed to load quizzes';
            this.loadingQuizzes = false;
          }
        });
        this.subscriptions.push(quizSub);
      },
      error: (err) => {
        this.errorQuizzes = 'Failed to check enrollment status';
        this.loadingQuizzes = false;
      }
    });
    this.subscriptions.push(enrollmentSub);

    this.loadAttempts();
  }

  loadAttempts(): void {
    this.loadingAttempts = true;

    const attemptSub = this.quizService.getAttempts().subscribe({
      next: (attempts) => {
        this.attempts = attempts;
        this.loadingAttempts = false;
      },
      error: (err) => {
        this.errorAttempts = 'Failed to load attempts';
        this.loadingAttempts = false;
      }
    });
    this.subscriptions.push(attemptSub);
  }

  get totalQuizzes(): number {
    return this.availableQuizzes.length;
  }

  get completedQuizzes(): number {
    const completedQuizIds = new Set(this.attempts
      .filter(a => a.status === 'completed' || a.status === 'graded' || a.status === 'submitted')
      .map(a => a.quizId));
    return completedQuizIds.size;
  }

  get inProgressCount(): number {
    const completedIds = new Set(this.attempts
      .filter(a => a.status === 'completed' || a.status === 'graded' || a.status === 'submitted')
      .map(a => a.quizId));

    const inProgressIds = new Set(this.attempts
      .filter(a => a.status === 'in_progress')
      .map(a => a.quizId));

    completedIds.forEach(id => inProgressIds.delete(id));
    return inProgressIds.size;
  }

  get quizzesLeftCount(): number {
    const completedIds = new Set(this.attempts
      .filter(a => a.status === 'completed' || a.status === 'graded' || a.status === 'submitted')
      .map(a => a.quizId));

    return this.availableQuizzes.filter(q => !completedIds.has(q._id)).length;
  }

  getQuizStatusDisplay(quiz: Quiz): string {
    const quizAttempts = this.attempts.filter(a => a.quizId === quiz._id);
    if (quizAttempts.length === 0) return 'Not Attempted';

    const hasCompleted = quizAttempts.some(a =>
      a.status === 'completed' || a.status === 'submitted' || a.status === 'graded'
    );
    if (hasCompleted) return 'Completed';

    const hasInProgress = quizAttempts.some(a => a.status === 'in_progress');
    if (hasInProgress) return 'Attempted / In Progress';

    return 'Not Attempted';
  }

  getBestScore(quizId: string): number | null {
    const quizAttempts = this.attempts.filter(a => a.quizId === quizId);
    if (quizAttempts.length === 0) return null;
    return Math.max(...quizAttempts.map(a => a.score && a.totalMarks ? (a.score / a.totalMarks) * 100 : 0));
  }

  getAttemptsCount(quizId: string): number {
    return this.attempts.filter(a => a.quizId === quizId).length;
  }

  startQuiz(quizId: string): void {
    if (this.loadingQuizzes) return;

    this.quizService.startAttempt(quizId).subscribe({
      next: (response) => {
        this.router.navigate(['/student/attempt-quiz'], {
          queryParams: { quizId: quizId }
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to start quiz. Please try again.' });
      }
    });
  }

  viewResults(quizId: string): void {
    const quizAttempts = this.attempts
      .filter(a => a.quizId === quizId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    if (quizAttempts.length > 0) {
      this.router.navigate(['/student/view-quizresults'], {
        queryParams: { attemptId: quizAttempts[0].attemptId }
      });
    }
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.applyFilters();
  }

  setSearch(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.availableQuizzes];

    if (this.currentFilter !== 'All Quizzes') {
      filtered = filtered.filter(q => this.getQuizStatusDisplay(q) === this.currentFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(q) ||
        quiz.course.courseTitle.toLowerCase().includes(q)
      );
    }

    this.filteredQuizzes = filtered;
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setSearch(target.value);
  }

  onFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.setFilter(target.value);
  }
}


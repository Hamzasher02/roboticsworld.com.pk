// =======================================================
// ✅ FILE 3: instructor-quiz-management.component.ts
// (Published quiz edit popup me module + timeLimit GET ho ga)
// =======================================================

import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { QuizApiService } from '../../../../core/services/teacher/quiz/quiz-api.service';
import {
  InstructorQuizDashboardQuiz,
  InstructorQuizDashboardStats,
  QuizStatus,
  SetStatusRequest,
} from '../../../../core/interfaces/teacher/quiz/quiz-api';

import { InstructorCoursesService } from '../../../../core/services/teacher/courses/courses.service';

type TabType = 'overview' | 'session' | 'completion';

interface QuizRow {
  id: string;
  title: string;
  saved?: boolean;
  questions: number;
  duration: string;
  created: string;
  status: QuizStatus;
  course: string;

  // ✅ now show module name in popup
  module: string;

  releaseLine1: string;
  releaseLine2?: string;
  attempts: number;

  publishAt?: string | null;

  // ✅ popup uses it
  difficulty?: string;

  // ✅ hidden data (no UI impact)
  courseId?: string;
  moduleId?: string;
  timeLimitMinutes?: number | null;
}

@Component({
  selector: 'app-instructor-quiz-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instructor-quiz-management.component.html',
})
export class InstructorQuizManagementComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private quizApi: QuizApiService,
    private instructorCourses: InstructorCoursesService
  ) {}

  selectedCourse = 'All Courses';
  selectedStatus = 'All Status';
  startDate = '2025-01-01';
  endDate = '2025-12-31';
  sortBy = 'Date Created';

  showManagePublishedQuiz = false;
  selectedQuiz: any = null;
  isManageLoading = false;

  activeTab: TabType = 'overview';
  showAiAssistant = false;

  showScheduledQuizModal = false;
  scheduledQuiz: any = null;

  scheduleForm = {
    releaseType: 'Release Immediately',
    releaseDate: '',
    releaseTime: '',
  };

  isLoadingDashboard = false;
  isSavingSchedule = false;
  isPublishingNow = false;

  stats = {
    totalQuizzes: 0,
    pendingDrafts: 0,
    scheduledReleases: 0,
    avgCompletion: 0,
  };

  quizzes: QuizRow[] = [];

  ngOnInit(): void {
    this.fetchDashboard();
  }

  private fetchDashboard(): void {
    this.isLoadingDashboard = true;

    this.quizApi
      .getInstructorDashboard()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoadingDashboard = false))
      )
      .subscribe({
        next: (res) => {
          const apiStats = res?.data?.stats;
          const apiQuizzes = res?.data?.quizzes ?? [];

          this.applyStats(apiStats);
          this.quizzes = apiQuizzes.map((q) => this.mapApiQuizToRow(q));
        },
        error: (err) => {
          console.error('Quiz dashboard API error:', err);
          this.stats = {
            totalQuizzes: 0,
            pendingDrafts: 0,
            scheduledReleases: 0,
            avgCompletion: 0,
          };
          this.quizzes = [];
        },
      });
  }

  private applyStats(api?: InstructorQuizDashboardStats): void {
    this.stats = {
      totalQuizzes: api?.totalQuizzes ?? 0,
      pendingDrafts: api?.pendingDrafts ?? 0,
      scheduledReleases: api?.scheduledReleases ?? 0,
      avgCompletion: api?.averageCompletion ?? 0,
    };
  }

  private mapApiQuizToRow(q: InstructorQuizDashboardQuiz): QuizRow {
    const status = (q.status ?? 'draft') as QuizStatus;
    const created = this.formatDate(q.createdAt);

    const publishDate = q.publishAt ? this.formatDate(q.publishAt) : null;
    const releaseLine1 = publishDate ? `Scheduled: ${publishDate}` : 'Immediate release';

    const courseTitle =
      typeof q.course === 'string' ? q.course : (q.course?.courseTitle ?? '');

    const courseId =
      typeof q.course === 'string' ? '' : (q.course?._id ?? '');

    return {
      id: q._id,
      title: q.title ?? '',
      saved: false,
      questions: q.totalQuestions ?? 0,
      duration: '—',
      created,
      status,

      course: courseTitle,
      module: '',

      releaseLine1,
      releaseLine2: undefined,
      attempts: q.totalAttempts ?? 0,

      publishAt: q.publishAt ?? null,

      // hidden
      courseId,
      moduleId: '',
      timeLimitMinutes: null,
      difficulty: 'Medium',
    };
  }

  private formatDate(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString();
  }

  private splitIsoToDateTime(iso?: string | null): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };
    const d = new Date(iso);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return { date, time };
  }

  private buildPublishAtIso(dateStr: string, timeStr: string): string {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    if (isNaN(d.getTime())) return '';
    return d.toISOString();
  }

  private formatTimeLimit(mins?: number | null): string {
    if (!mins || mins <= 0) return '—';
    return `${mins} min`;
  }

  // -------------------------
  // Your existing methods
  // -------------------------
  viewQuiz(quiz: QuizRow): void {
    if (!quiz.id) {
      console.error('Quiz ID missing:', quiz);
      return;
    }
    this.router.navigate(['/instructor/instructor-quiz/quiz-overview', quiz.id]);
  }

  createQuiz(): void {
    this.router.navigate(['/instructor/instructor-quiz/create-quiz']);
  }

  setTab(tab: TabType) {
    this.activeTab = tab;
  }

  toggleAiAssistant() {
    this.showAiAssistant = !this.showAiAssistant;
  }

  closeAiAssistant() {
    this.showAiAssistant = false;
  }

  // ✅ FIX: Published popup opens + fetch getQuiz to fill module & timeLimit
  openManagePublishedQuiz(q: QuizRow): void {
    this.showManagePublishedQuiz = true;

    // fallback
    this.selectedQuiz = {
      ...q,
      questions: q?.questions ?? 0,
      timeLimit: q?.duration ?? '—',
      difficulty: q?.difficulty ?? 'Medium',
      created: q?.created ?? '',
      status: q?.status ?? 'published',
      module: q?.module ?? '',
      course: q?.course ?? '',
      title: q?.title ?? '',
    };

    if (!q?.id) return;

    this.isManageLoading = true;

    this.quizApi
      .getQuiz(q.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isManageLoading = false))
      )
      .subscribe({
        next: (res) => {
          const quiz: any = res?.data ?? null;
          if (!quiz) return;

          const courseId =
            typeof quiz.course === 'string'
              ? ''
              : (quiz.course?._id ?? '');

          const courseTitle =
            typeof quiz.course === 'string'
              ? quiz.course
              : (quiz.course?.courseTitle ?? '');

          const moduleId =
            typeof quiz.module === 'string'
              ? quiz.module
              : (quiz.module?._id ?? '');

          const timeLimit = this.formatTimeLimit(quiz?.settings?.timeLimitMinutes);

          // if no courseId or moduleId -> set what we have
          if (!courseId || !moduleId) {
            this.selectedQuiz = {
              ...this.selectedQuiz,
              title: quiz?.title ?? this.selectedQuiz?.title,
              course: courseTitle || this.selectedQuiz?.course,
              module: this.selectedQuiz?.module,
              timeLimit,
              created: this.formatDate(quiz?.createdAt) || this.selectedQuiz?.created,
              questions: quiz?.totalQuestions ?? this.selectedQuiz?.questions,
              status: quiz?.status ?? this.selectedQuiz?.status,
            };
            return;
          }

          // ✅ resolve module name from course modules API
          this.instructorCourses
            .getCourseModulesUserSide(courseId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (mRes: any) => {
                const list = mRes?.data ?? [];
                const mod = list.find((m: any) => m?._id === moduleId);
                const moduleName = mod?.moduleName ?? '';

                this.selectedQuiz = {
                  ...this.selectedQuiz,
                  title: quiz?.title ?? this.selectedQuiz?.title,
                  course: courseTitle || this.selectedQuiz?.course,
                  module: moduleName || this.selectedQuiz?.module,
                  timeLimit,
                  created: this.formatDate(quiz?.createdAt) || this.selectedQuiz?.created,
                  questions: quiz?.totalQuestions ?? this.selectedQuiz?.questions,
                  status: quiz?.status ?? this.selectedQuiz?.status,
                };
              },
              error: (err) => {
                console.error('getCourseModulesUserSide error:', err);
                this.selectedQuiz = {
                  ...this.selectedQuiz,
                  title: quiz?.title ?? this.selectedQuiz?.title,
                  course: courseTitle || this.selectedQuiz?.course,
                  timeLimit,
                };
              },
            });
        },
        error: (err) => {
          console.error('getQuiz for manage popup error:', err);
        },
      });
  }

  closeManagePublishedQuiz(): void {
    this.showManagePublishedQuiz = false;
    this.selectedQuiz = null;
  }

  archiveQuiz(q: any): void {
    console.log('Archive Quiz:', q);
    this.closeManagePublishedQuiz();
  }

  duplicateQuiz(q: any): void {
    console.log('Duplicate Quiz:', q);
    this.closeManagePublishedQuiz();
  }

  editQuiz(q: QuizRow) {
    console.log('Edit quiz:', q);
  }

  onEditClick(q: QuizRow): void {
    if (q.status === 'draft') {
      this.router.navigate(['/instructor/instructor-quiz/edit-quiz', q.id]);
      return;
    }

    if (q.status === 'published') {
      this.openManagePublishedQuiz(q);
      return;
    }

    if (q.status === 'scheduled') {
      this.openScheduledQuizModal(q);
      return;
    }

    this.openManagePublishedQuiz(q);
  }

  openScheduledQuizModal(q: QuizRow): void {
    this.scheduledQuiz = {
      ...q,
      questions: q?.questions ?? 0,
      duration: q?.duration ?? '—',
      difficulty: q?.difficulty ?? 'Medium',
      created: q?.created ?? '',
      status: q?.status ?? 'scheduled',
      module: q?.module ?? '',
      course: q?.course ?? '',
      title: q?.title ?? '',
      publishAt: q?.publishAt ?? null,
    };

    const hasSchedule = !!this.scheduledQuiz?.publishAt;
    const dt = this.splitIsoToDateTime(this.scheduledQuiz?.publishAt);

    this.scheduleForm = {
      releaseType: hasSchedule ? 'Schedule Release' : 'Release Immediately',
      releaseDate: hasSchedule ? dt.date : '',
      releaseTime: hasSchedule ? dt.time : '',
    };

    this.showScheduledQuizModal = true;
  }

  closeScheduledQuizModal(): void {
    this.showScheduledQuizModal = false;
    this.scheduledQuiz = null;
  }

  publishNowScheduled(): void {
    const quizId = this.scheduledQuiz?.id;
    if (!quizId) {
      console.error('Scheduled quiz id missing:', this.scheduledQuiz);
      return;
    }

    this.isPublishingNow = true;

    const payload: SetStatusRequest = { status: 'published' };

    this.quizApi
      .setStatus(quizId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isPublishingNow = false))
      )
      .subscribe({
        next: () => {
          this.closeScheduledQuizModal();
          this.fetchDashboard();
        },
        error: (err) => {
          console.error('Publish now error:', err);
        },
      });
  }

  saveSchedule(): void {
    const quizId = this.scheduledQuiz?.id;
    if (!quizId) {
      console.error('Scheduled quiz id missing:', this.scheduledQuiz);
      return;
    }

    const isSchedule = this.scheduleForm.releaseType === 'Schedule Release';

    let payload: SetStatusRequest = { status: 'published' };

    if (isSchedule) {
      if (!this.scheduleForm.releaseDate || !this.scheduleForm.releaseTime) {
        console.error('Release date/time missing:', this.scheduleForm);
        return;
      }

      const publishAt = this.buildPublishAtIso(
        this.scheduleForm.releaseDate,
        this.scheduleForm.releaseTime
      );
      if (!publishAt) {
        console.error('Invalid publishAt:', this.scheduleForm);
        return;
      }

      payload = { status: 'scheduled', publishAt };
    }

    this.isSavingSchedule = true;

    this.quizApi
      .setStatus(quizId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSavingSchedule = false))
      )
      .subscribe({
        next: () => {
          this.closeScheduledQuizModal();
          this.fetchDashboard();
        },
        error: (err) => {
          console.error('Save schedule error:', err);
        },
      });
  }

  statusBadgeClass(status: QuizStatus): string {
    switch (status) {
      case 'published':
        return 'bg-[#DCFCE7] text-[#166534]';
      case 'draft':
        return 'bg-[#FFEDD5] text-[#9A3412]';
      case 'scheduled':
        return 'bg-[#DBEAFE] text-[#1D4ED8]';
      case 'pending':
        return 'bg-[#FEE2E2] text-[#B91C1C]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}

// create-manual-quiz.component.ts (COMPLETE)

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ManualAddQuestionComponent } from '../manual-add-question/manual-add-question.component';

import { QuizApiService } from '../../../../core/services/teacher/quiz/quiz-api.service';
import {
  CreateQuizRequest,
  Quiz,
  QuizSummary,
  UpdateSettingsRequest,
  QuizShowResults,
} from '../../../../core/interfaces/teacher/quiz/quiz-api';

import { InstructorCoursesService } from '../../../../core/services/teacher/courses/courses.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast/toast.service';

type StepKey = 'setup' | 'questions' | 'settings' | 'preview';

type StepItem = {
  key: StepKey;
  label: string;
  active: boolean;
  icon: string;
  iconWhite: string;
};

type UiCourse = { id: string; name: string };
type UiModule = { id: string; name: string };

@Component({
  selector: 'app-create-manual-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, ManualAddQuestionComponent],
  templateUrl: './create-manual-quiz.component.html',
})
export class CreateManualQuizComponent implements OnInit {
  private readonly router = inject(Router); // ✅ add
  private readonly destroyRef = inject(DestroyRef);
  private readonly quizApi = inject(QuizApiService);
  private readonly instructorCourses = inject(InstructorCoursesService);
  private readonly toast = inject(ToastService);

  showGeneratedQuestions = false;

  // ✅ created quiz id
  quizId: string | null = null;

  // ✅ loading flags
  isCreatingQuiz = false;
  isCoursesLoading = false;
  isModulesLoading = false;
  isAddingQuestion = false;
  isFetchingQuiz = false;

  // ✅ new flags for settings/summary/status
  isSummaryLoading = false;
  isSavingSettings = false;
  isPublishing = false;
  isSavingDraft = false;

  header = {
    title: 'Create Manual Quiz',
    subtitle: 'Build your quiz step by step',
    headerIcon: '/assets/instructor-images/quiz/Vector (3).svg',
  };

  private stepOrder: StepKey[] = ['setup', 'questions', 'settings', 'preview'];
  currentStep: StepKey = 'setup';

  steps: StepItem[] = [
    {
      key: 'setup',
      label: 'Setup',
      active: true,
      icon: '/assets/instructor-images/quiz/Vector (9).svg',
      iconWhite: '/assets/instructor-images/quiz/white1.svg',
    },
    {
      key: 'questions',
      label: 'Questions',
      active: false,
      icon: '/assets/instructor-images/quiz/Vector (11).svg',
      iconWhite: '/assets/instructor-images/quiz/white3.svg',
    },
    {
      key: 'settings',
      label: 'Settings',
      active: false,
      icon: '/assets/instructor-images/quiz/Vector (12).svg',
      iconWhite: '/assets/instructor-images/quiz/white4.svg',
    },
    {
      key: 'preview',
      label: 'Preview',
      active: false,
      icon: '/assets/instructor-images/quiz/Vector (10).svg',
      iconWhite: '/assets/instructor-images/quiz/white2.svg',
    },
  ];

  // =========================
  // Setup form (binds to UI)
  // =========================
  form = {
    quizTitle: '',
    course: '',
    module: '',
    description: '',
    category: 'Assessment',
  };

  courses: UiCourse[] = [];
  modules: UiModule[] = [];
  categories = ['Assessment', 'Practice', 'Placement', 'Pre-Assessment'];

  // =========================
  // Question builder state
  // =========================
  question = {
    type: 'mcq' as 'mcq',
    title: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    points: 1,
    difficulty: 'Easy',
    explanation: '',
  };

  // API questions for preview compatibility
  quizQuestions: Array<{
    _id: string;
    prompt: string;
    options: Array<{ label: string; text: string; isCorrect: boolean }>;
    correctAnswers: string[];
    points: number;
    difficulty: string;
    explanation: string;
  }> = [];

  // Local questions array (kept for your current preview UI)
  questions: Array<{
    title: string;
    options: string[];
    correctIndex: number;
    points: number;
    difficulty: string;
    explanation: string;
  }> = [];

  // ✅ UI settings model (what your template binds to)
  settings = {
    timeLimit: 60,
    attemptsAllowed: '1 attempt',
    passingScore: 70,
    showResults: 'After submission',
    randomizeOrder: false,
    allowBack: true,
    showProgress: true,
  };

  // ✅ summary from GET /getSummary/:quizId (for right card)
  quizSummary: QuizSummary | null = null;

  // =========================
  // Lifecycle
  // =========================
  ngOnInit(): void {
    this.loadAssignedCourses();
  }

  // =========================
  // Courses + Modules APIs
  // =========================
  loadAssignedCourses(page = 1, limit = 50): void {
    this.isCoursesLoading = true;

    this.instructorCourses
      .getMyAssignedCourses(page, limit)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isCoursesLoading = false))
      )
      .subscribe({
        next: (res) => {
          const list = res?.data ?? [];

          this.courses = list
            .map((c: any) => ({ id: c?._id, name: c?.courseTitle ?? '-' }))
            .filter((c: UiCourse) => !!c.id);

          if (this.form.course) this.loadModulesByCourse(this.form.course);
        },
        error: (err) => {
          console.error('getMyAssignedCourses error:', err);
          this.courses = [];
        },
      });
  }

  onCourseChange(courseId: string): void {
    this.form.module = '';
    this.modules = [];
    if (!courseId) return;
    this.loadModulesByCourse(courseId);
  }

  private loadModulesByCourse(courseId: string): void {
    this.isModulesLoading = true;

    this.instructorCourses
      .getCourseModulesUserSide(courseId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isModulesLoading = false))
      )
      .subscribe({
        next: (res) => {
          const list = res?.data ?? [];
          this.modules = list
            .filter((m: any) => !m?.isDeleted)
            .map((m: any) => ({ id: m?._id, name: m?.moduleName ?? '-' }))
            .filter((m: UiModule) => !!m.id);
        },
        error: (err) => {
          console.error('getAllCourseModuleUserSide error:', err);
          this.modules = [];
        },
      });
  }

  // =========================
  // Stepper helpers
  // =========================
  get activeIndex(): number {
    return this.stepOrder.indexOf(this.currentStep);
  }

  isCompletedByIndex(i: number): boolean {
    return i < this.activeIndex;
  }

  setStep(step: StepKey): void {
    this.currentStep = step;
    this.steps = this.steps.map((s) => ({ ...s, active: s.key === step }));

    // ✅ when entering settings or preview, refresh summary
    if (step === 'settings') {
      this.fetchSummaryAndPrefillSettings();
    }
    if (step === 'preview') {
      this.fetchSummary();
    }
  }

  // =========================
  // Navigation
  // =========================
  goBack(): void {
    window.history.back();
  }

  // =========================
  // Setup -> Create quiz
  // =========================
  nextAddQuestions(): void {
    if (this.quizId) {
      this.setStep('questions');
      return;
    }

    const payload: CreateQuizRequest = {
      title: (this.form.quizTitle ?? '').trim(),
      course: this.form.course || '',
      module: this.form.module ? this.form.module : null,
      description: (this.form.description ?? '').trim(),
      category: this.form.category || 'Assessment',
    };

    if (!payload.title) { this.toast.warning('Quiz Title is required'); return; }
    if (!payload.course) { this.toast.warning('Course is required'); return; }

    this.isCreatingQuiz = true;

    this.quizApi
      .createQuiz(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isCreatingQuiz = false))
      )
      .subscribe({
        next: (res) => {
          const created: Quiz | null = (res?.data as any) ?? null;
          this.quizId = created?._id ?? null;
          this.setStep('questions');
        },
        error: (err) => {
          console.error('createQuiz error:', err);
          this.toast.error(err?.error?.message ?? 'Failed to create quiz');
        },
      });
  }

  backToSetup(): void {
    this.setStep('setup');
  }

  backToQuestions(): void {
    this.showGeneratedQuestions = false;
    this.setStep('questions');
  }

  backToSettings(): void {
    this.setStep('settings');
  }

  // =========================
  // Questions
  // =========================
  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  addQuestionApi(): void {
    if (!this.quizId) { this.toast.warning('Please create quiz first (Setup step).'); return; }

    const prompt = (this.question.title ?? '').trim();
    if (!prompt || prompt.length < 5) {
      this.toast.warning('Question must be at least 5 characters');
      return;
    }

    const opts = (this.question.options ?? []).map((x) => (x ?? '').trim());
    if (opts.some((x) => !x)) { this.toast.warning('All options are required'); return; }

    const correctIndex = Number(this.question.correctIndex ?? 0);
    if (Number.isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      this.toast.warning('Please select correct answer');
      return;
    }

    const payload = {
      type: 'multipleChoice' as const,
      prompt,
      options: opts.map((text, i) => ({
        label: String.fromCharCode(65 + i),
        text,
        isCorrect: i === correctIndex,
      })),
      correctAnswers: [opts[correctIndex]],
      points: Number(this.question.points) || 1,
      difficulty: (this.question.difficulty || 'easy').toLowerCase() as any,
      explanation: (this.question.explanation ?? '').trim(),
      tags: [],
      source: 'Manual',
    };

    this.isAddingQuestion = true;

    this.quizApi
      .addQuestion(this.quizId, payload as any)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isAddingQuestion = false))
      )
      .subscribe({
        next: () => {
          this.question.title = '';
          this.question.options = ['', '', '', ''];
          this.question.correctIndex = 0;
          this.question.points = 1;
          this.question.difficulty = 'Easy';
          this.question.explanation = '';
          this.showGeneratedQuestions = true;
        },
        error: (err) => {
          console.error('[ERROR] addQuestion failed =>', err);
          this.toast.error(err?.error?.message ?? 'Failed to add question');
        },
      });
  }

  closeGeneratedQuestions(): void {
    this.showGeneratedQuestions = false;
  }

  goToSettingsFromGenerated(): void {
    this.showGeneratedQuestions = false;
    this.setStep('settings');
  }

  nextQuizSettings(): void {
    this.showGeneratedQuestions = false;
    this.setStep('settings');
    this.fetchQuizData();
  }

  // ✅ Settings page se Preview open (sirf navigate + data refresh)
  goToPreview(): void {
    this.setStep('preview');
    this.fetchQuizData();
    this.fetchSummary();
  }

  // ✅ Settings page ka Publish button bhi navigate hi kare (aapka current flow)
  publishQuiz(): void {
    this.setStep('preview');
    this.fetchQuizData();
    this.fetchSummary();
  }

  // =========================
  // Fetch quiz data (questions etc.)
  // =========================
  fetchQuizData(): void {
    if (!this.quizId) return;

    this.isFetchingQuiz = true;

    this.quizApi
      .getQuiz(this.quizId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isFetchingQuiz = false))
      )
      .subscribe({
        next: (res) => {
          if (res?.success && res?.data) {
            const quizData: any = res.data;

            this.form.quizTitle = quizData.title || '';
            this.form.description = quizData.description || '';
            this.form.category = quizData.category || 'Assessment';

            this.quizQuestions = quizData.questions || [];

            this.questions = this.quizQuestions.map((q: any) => ({
              title: q.prompt,
              options: (q.options ?? []).map((o: any) => o.text),
              correctIndex: (q.options ?? []).findIndex((o: any) => o.isCorrect),
              points: q.points,
              difficulty: q.difficulty,
              explanation: q.explanation || '',
            }));
          }
        },
        error: (err) => {
          console.error('[ERROR] getQuiz failed =>', err);
        },
      });
  }

  // =========================
  // ✅ SUMMARY
  // =========================
  private fetchSummary(): void {
    if (!this.quizId) return;

    this.isSummaryLoading = true;

    this.quizApi
      .getSummary(this.quizId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSummaryLoading = false))
      )
      .subscribe({
        next: (res) => {
          this.quizSummary = res?.data ?? null;
        },
        error: (err) => {
          console.error('[ERROR] getSummary failed =>', err);
          this.quizSummary = null;
        },
      });
  }

  private fetchSummaryAndPrefillSettings(): void {
    if (!this.quizId) return;

    this.isSummaryLoading = true;

    this.quizApi
      .getSummary(this.quizId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSummaryLoading = false))
      )
      .subscribe({
        next: (res) => {
          const summary = res?.data ?? null;
          this.quizSummary = summary;

          if (summary?.settings) {
            this.applyApiSettingsToUi(summary.settings);
          }
        },
        error: (err) => {
          console.error('[ERROR] getSummary failed =>', err);
          this.quizSummary = null;
        },
      });
  }

  // =========================
  // ✅ SETTINGS save
  // =========================
  private buildUpdateSettingsPayload(): UpdateSettingsRequest {
    const attempts = this.parseAttemptsAllowed(this.settings.attemptsAllowed);
    const showResults = this.mapUiShowResultsToApi(this.settings.showResults);

    return {
      timeLimitMinutes: Number(this.settings.timeLimit) || 0,
      attemptsAllowed: attempts,
      passingScorePercent: Number(this.settings.passingScore) || 0,
      randomizeQuestions: !!this.settings.randomizeOrder,
      allowBackNavigation: !!this.settings.allowBack,
      showProgressBar: !!this.settings.showProgress,
      showResults,
    };
  }

  saveSettingsOnly(): void {
    if (!this.quizId) { this.toast.warning('Quiz not created yet.'); return; }

    const payload = this.buildUpdateSettingsPayload();

    this.isSavingSettings = true;

    this.quizApi
      .updateSettings(this.quizId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSavingSettings = false)),
        tap(() => this.fetchSummary())
      )
      .subscribe({
        next: (res) => {
          this.toast.success(res?.message ?? 'Settings saved');
        },
        error: (err) => {
          console.error('[ERROR] updateSettings failed =>', err);
          this.toast.error(err?.error?.message ?? 'Failed to save settings');
        },
      });
  }

  // =========================
  // ✅ STATUS flows
  // =========================
  saveDraft(): void {
    if (!this.quizId) { this.toast.warning('Quiz not created yet.'); return; }

    const payload = this.buildUpdateSettingsPayload();

    this.isSavingDraft = true;

    this.quizApi
      .updateSettings(this.quizId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.quizApi.setStatus(this.quizId!, { status: 'draft' })),
        tap(() => this.fetchSummary()),
        finalize(() => (this.isSavingDraft = false))
      )
      .subscribe({
        next: (res) => {
          this.toast.success(res?.message ?? 'Saved as draft');
          this.goToInstructorQuiz();


        },
        error: (err) => {
          console.error('[ERROR] saveDraft flow failed =>', err);
          this.toast.error(err?.error?.message ?? 'Failed to save draft');
        },
      });
  }

  finalPublishQuiz(): void {
    if (!this.quizId) { this.toast.warning('Quiz not created yet.'); return; }

    const payload = this.buildUpdateSettingsPayload();

    this.isPublishing = true;

    this.quizApi
      .updateSettings(this.quizId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() =>
          this.quizApi.setStatus(this.quizId!, { status: 'published' })
        ),
        tap(() => this.fetchSummary()),
        finalize(() => (this.isPublishing = false))
      )
      .subscribe({
        next: (res) => {
          this.toast.success(res?.message ?? 'Quiz published successfully');
        },
        error: (err) => {
          console.error('[ERROR] publish flow failed =>', err);
          this.toast.error(err?.error?.message ?? 'Failed to publish quiz');
        },
      });
  }

  // / ✅ COMMON PUBLISH (Settings + Preview both)
  publishAndGoToInstructorQuiz(): void {
    if (!this.quizId) { this.toast.warning('Quiz not created yet.'); return; }

    const payload = this.buildUpdateSettingsPayload();

    this.isPublishing = true;

    this.quizApi
      .updateSettings(this.quizId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.quizApi.setStatus(this.quizId!, { status: 'published' })),
        tap(() => this.fetchSummary()),
        finalize(() => (this.isPublishing = false))
      )
      .subscribe({
        next: (res) => {
          this.toast.success(res?.message ?? 'Quiz published successfully');
          // ✅ navigate to instructor-quiz route
          this.goToInstructorQuiz();
        },
        error: (err) => {
          console.error('[ERROR] publish flow failed =>', err);
          this.toast.error(err?.error?.message ?? 'Failed to publish quiz');
        },
      });
  }
  // =========================
  // ✅ Mapping helpers (UI <-> API)
  // =========================
  private parseAttemptsAllowed(ui: string): number {
    const v = (ui ?? '').toLowerCase().trim();
    if (v.includes('unlimited')) return 999999;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  private mapUiShowResultsToApi(ui: string): QuizShowResults {
    const v = (ui ?? '').toLowerCase().trim();

    if (v.includes('immediately')) return 'immediately';
    if (v.includes('after submission')) return 'later';
    if (v.includes('after due date')) return 'after_due_date';
    if (v.includes('never')) return 'never';

    return 'later';
  }

  private mapApiShowResultsToUi(api: QuizShowResults): string {
    if (api === 'immediately') return 'Immediately';
    if (api === 'later') return 'After submission';
    if (api === 'after_due_date') return 'After due date';
    if (api === 'never') return 'Never';
    return 'After submission';
  }

  private applyApiSettingsToUi(api: {
    timeLimitMinutes: number;
    attemptsAllowed: number;
    passingScorePercent: number;
    randomizeQuestions: boolean;
    allowBackNavigation: boolean;
    showProgressBar: boolean;
    showResults: QuizShowResults;
  }): void {
    this.settings.timeLimit = Number(api.timeLimitMinutes) || 0;
    this.settings.attemptsAllowed =
      api.attemptsAllowed >= 999999
        ? 'Unlimited'
        : `${Number(api.attemptsAllowed) || 1} attempt${api.attemptsAllowed === 1 ? '' : 's'
        }`;

    this.settings.passingScore = Number(api.passingScorePercent) || 0;
    this.settings.randomizeOrder = !!api.randomizeQuestions;
    this.settings.allowBack = !!api.allowBackNavigation;
    this.settings.showProgress = !!api.showProgressBar;
    this.settings.showResults = this.mapApiShowResultsToUi(api.showResults);
  }

  // =========================
  // Question builder helpers
  // =========================
  selectQuestionType(type: 'mcq'): void {
    this.question.type = type;
  }

  setCorrect(index: number): void {
    this.question.correctIndex = index;
  }

  get totalPoints(): number {
    return this.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  }

  get selectedCourseName(): string {
    const c = this.courses.find((x) => x.id === this.form.course);
    return c?.name || '-';
  }

  get selectedModuleName(): string {
    const m = this.modules.find((x) => x.id === this.form.module);
    return m?.name || '-';
  }

  trackByIndex(index: number): number {
    return index;
  }

  updateOption(index: number, value: string): void {
    this.question.options[index] = value;
  }
  private goToInstructorQuiz(): void {
    this.router.navigate(['/instructor/instructor-quiz']);
  }

}

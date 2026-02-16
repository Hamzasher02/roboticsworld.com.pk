// ✅ edit-quiz.component.ts (FULL UPDATED + questions show fix + published guard)
// path: .../edit-quiz/edit-quiz.component.ts

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { QuizApiService } from '../../../../core/services/teacher/quiz/quiz-api.service';
import type {
  AddQuestionRequest,
  Quiz,
  QuizQuestion,
  SetStatusRequest,
  UpdateQuizInfoRequest,
  UpdateSettingsRequest,
} from '../../../../core/interfaces/teacher/quiz/quiz-api';

// ---------- UI TYPES ----------
type StepKey = 'details' | 'questions' | 'settings' | 'preview';
type QuestionType = 'mcq' | 'tf' | 'short' | 'essay';

interface OptionRow {
  text: string;
  isCorrect?: boolean;
}

interface UiQuestion {
  id: string;
  qNo: number;
  type: QuestionType;
  typeLabel: string;
  points: number;
  questionText: string;
  options?: OptionRow[];
  tfAnswer?: boolean;
  shortAnswer?: string;
  explanation?: string;
}

@Component({
  selector: 'app-edit-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-quiz.component.html',
})
export class EditQuizComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  isOpen = true;

  quizId = '';
  isLoading = false;

  // ✅ API action loaders
  isSavingDraft = false;
  isPublishing = false;
  isSavingQuestion = false;
  isDeletingQuestion = false;

  activeStep: StepKey = 'details';

  // ✅ edit mode for question
  editingQuestionId: string | null = null;

  // ✅ keep last loaded quiz (helpful)
  private loadedQuiz: Quiz | null = null;

  form = {
    title: '',
    course: '', // UI display only (course title)
    description: '',
    timeLimit: 0,
    attemptsAllowed: '1 attempt',
    passingScore: 0,
    randomize: false,
    status: 'draft',
  };

  questionForm = {
    type: 'mcq' as QuestionType,
    questionText: '',
    options: [
      { text: 'Option A' },
      { text: 'Option B' },
      { text: 'Option C' },
      { text: 'Option D' },
    ] as OptionRow[],
    correctIndex: 0,
    points: 1,
    explanation: '',
    tfAnswer: true,
    shortAnswer: '',
  };

  questions: UiQuestion[] = [];

  settings = {
    timeLimit: 0,
    passingScore: 0,

    showResults: 'After submission',
    showCorrectAnswers: 'After all attempts',
    attemptsAllowed: '1 attempt',

    questionRandomization: 'Disabled',
    lateSubmission: 'Not allowed',
    proctoring: 'Disabled',

    shuffleOptions: true,
    autoSave: true,
    showProgress: true,
    allowReview: true,

    accessCode: '',
    ipRestrictions: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizApi: QuizApiService
  ) {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(): void {
    if (!this.quizId) return;
    this.loadQuiz(this.quizId);
  }

  // =========================
  // ✅ status helpers
  // =========================
  private normalizeStatus(v: any): string {
    return (v ?? '').toString().trim().toLowerCase();
  }

  // backend rule: published/scheduled me questions edit blocked
  get canEditQuestions(): boolean {
    const st = this.normalizeStatus(this.form.status);
    return st === 'draft';
  }

  get canAddQuestionNow(): boolean {
    if (!this.canEditQuestions) return false;

    const prompt = (this.questionForm.questionText ?? '').trim();
    if (!prompt) return false;

    if (this.questionForm.type === 'mcq') {
      const opts = (this.questionForm.options ?? []).map((o) => (o?.text ?? '').trim());
      if (opts.length < 2) return false;
      if (opts.some((x) => !x)) return false;
      return true;
    }

    if (this.questionForm.type === 'tf') return true;
    if (this.questionForm.type === 'short') return true;

    // essay not supported
    return false;
  }

  // =========================
  // ✅ LOAD QUIZ (handles BOTH response shapes)
  // =========================
  private loadQuiz(id: string): void {
    this.isLoading = true;

    this.quizApi
      .getQuiz(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (res) => {
          const data: any = res?.data ?? null;

          // ✅ Shape A: data is quiz object { ..., questions: [] }
          // ✅ Shape B: data.quiz is quiz object, data.questions is questions array
          const quizObj: any = data?.quiz ?? data ?? null;
          const questionsArr: any[] = Array.isArray(data?.questions)
            ? data.questions
            : Array.isArray(quizObj?.questions)
              ? quizObj.questions
              : [];

          if (!quizObj) return;

          this.loadedQuiz = quizObj as Quiz;

          // ---------- DETAILS ----------
          this.form.title = quizObj.title ?? '';
          this.form.description = quizObj.description ?? '';
          this.form.status = quizObj.status ?? 'draft';

          const course = quizObj.course as any;
          this.form.course = typeof course === 'string' ? '' : (course?.courseTitle ?? '');

          // ---------- SETTINGS ----------
          const s: any = quizObj.settings ?? {};
          this.form.timeLimit = s.timeLimitMinutes ?? 0;
          this.form.passingScore = s.passingScorePercent ?? 0;
          this.form.randomize = !!s.randomizeQuestions;

          this.settings.timeLimit = s.timeLimitMinutes ?? 0;
          this.settings.passingScore = s.passingScorePercent ?? 0;
          this.settings.attemptsAllowed = `${s.attemptsAllowed ?? 1} attempt${(s.attemptsAllowed ?? 1) > 1 ? 's' : ''}`;

          // ✅ backend uses later | after_due_date | immediately | never
          this.settings.showResults =
            s.showResults === 'after_due_date'
              ? 'After due date'
              : s.showResults === 'immediately'
                ? 'Immediately'
                : s.showResults === 'never'
                  ? 'Never'
                  : 'After submission'; // later

          this.settings.questionRandomization = s.randomizeQuestions ? 'Enabled' : 'Disabled';
          this.settings.showProgress = !!s.showProgressBar;
          this.settings.allowReview = !!s.allowBackNavigation;

          // ---------- QUESTIONS ----------
          this.questions = questionsArr
            .slice()
            .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
            .map((item: any, idx: number) => this.mapApiQuestionToUi(item, idx + 1));
        },
        error: (err) => {
          console.error('getQuiz error:', err);
          this.questions = [];
        },
      });
  }

  private mapApiQuestionToUi(item: any, qNo: number): UiQuestion {
    const apiType = (item?.type ?? '').toString();

    const type: QuestionType =
      apiType === 'multipleChoice' ? 'mcq'
        : apiType === 'trueFalse' ? 'tf'
          : apiType === 'shortAnswer' ? 'short'
            : 'essay';

    const typeLabel =
      type === 'mcq' ? 'Multiple Choice'
        : type === 'tf' ? 'True/False'
          : type === 'short' ? 'Short Answer'
            : 'Essay';

    const options: OptionRow[] | undefined =
      type === 'mcq' && Array.isArray(item?.options)
        ? item.options.map((o: any) => ({
          text: o?.text ?? '',
          isCorrect: !!o?.isCorrect,
        }))
        : undefined;

    // TF guess from correctAnswers if tfAnswer not present
    let tfAnswer: boolean | undefined = undefined;
    if (type === 'tf') {
      const ca = Array.isArray(item?.correctAnswers) ? item.correctAnswers : [];
      const v = (ca?.[0] ?? '').toString().toLowerCase();
      if (v === 'true') tfAnswer = true;
      else if (v === 'false') tfAnswer = false;
      else tfAnswer = true;
    }

    const shortAnswer =
      type === 'short'
        ? (item?.shortAnswer ??
          (Array.isArray(item?.correctAnswers) ? (item.correctAnswers?.[0] ?? '') : ''))
        : undefined;

    return {
      id: item?._id ?? '',
      qNo,
      type,
      typeLabel,
      points: item?.points ?? 0,
      questionText: item?.prompt ?? '',
      options,
      tfAnswer,
      shortAnswer,
      explanation: item?.explanation ?? '',
    };
  }

  // =========================
  // UI helpers
  // =========================
  setStep(step: StepKey) {
    this.activeStep = step;
  }

  totalQuestions(): number {
    return this.questions.length;
  }

  totalPoints(): number {
    return this.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  }

  setQuestionType(type: QuestionType) {
    this.questionForm.type = type;
    this.editingQuestionId = null;
  }

  close(): void {
    this.router.navigate(['/instructor/instructor-quiz']);
    this.isOpen = false;
  }

  // =========================
  // ✅ SAVE DRAFT
  // =========================
  saveDraft(): void {
    if (!this.quizId) return;

    this.isSavingDraft = true;

    forkJoin({
      info: this.quizApi.updateInfo(this.quizId, this.buildUpdateInfoPayload()),
      settings: this.quizApi.updateSettings(this.quizId, this.buildUpdateSettingsPayload()),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => {
          const statusPayload: SetStatusRequest = { status: 'draft' };
          return this.quizApi.setStatus(this.quizId, statusPayload);
        }),
        finalize(() => (this.isSavingDraft = false))
      )
      .subscribe({
        next: () => {
          this.loadQuiz(this.quizId);
        },
        error: (err) => {
          console.error('saveDraft failed:', err);
        },
      });
  }

  // =========================
  // ✅ PUBLISH
  // =========================
  publish(): void {
    if (!this.quizId) return;

    this.isPublishing = true;

    forkJoin({
      info: this.quizApi.updateInfo(this.quizId, this.buildUpdateInfoPayload()),
      settings: this.quizApi.updateSettings(this.quizId, this.buildUpdateSettingsPayload()),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => {
          const statusPayload: SetStatusRequest = { status: 'published' };
          return this.quizApi.setStatus(this.quizId, statusPayload);
        }),
        finalize(() => (this.isPublishing = false))
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/instructor/instructor-quiz']);
        },
        error: (err) => {
          console.error('publish failed:', err);
        },
      });
  }

  private buildUpdateInfoPayload(): UpdateQuizInfoRequest {
    return {
      title: (this.form.title ?? '').trim(),
      description: (this.form.description ?? '').trim(),
    };
  }

  private buildUpdateSettingsPayload(): UpdateSettingsRequest {
    const attempts = this.parseAttempts(this.settings.attemptsAllowed);

    return {
      timeLimitMinutes: Number(this.settings.timeLimit ?? 0) || 0,
      passingScorePercent: Number(this.settings.passingScore ?? 0) || 0,
      attemptsAllowed: attempts,
      randomizeQuestions: this.settings.questionRandomization === 'Enabled' || !!this.form.randomize,
      allowBackNavigation: !!this.settings.allowReview,
      showProgressBar: !!this.settings.showProgress,
      showResults: this.mapShowResultsToBackend(this.settings.showResults),
    };
  }

  private parseAttempts(v: string): number {
    const lower = (v ?? '').toLowerCase();
    if (lower.includes('unlimited')) return 999;
    const n = parseInt(lower, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  // ✅ FIX: default should be 'later' (After submission)
  private mapShowResultsToBackend(v: string): string {
    const val = (v ?? '').toLowerCase();
    if (val.includes('due')) return 'after_due_date';
    if (val.includes('immediately')) return 'immediately';
    if (val.includes('never')) return 'never';
    return 'later';
  }

  // =========================
  // ✅ QUESTIONS CRUD
  // =========================
  addQuestion(): void {
    if (!this.quizId) return;

    if (!this.canEditQuestions) {
      console.warn('Cannot edit questions in published/scheduled quiz');
      return;
    }

    if (this.questionForm.type === 'essay') {
      console.error('Essay type is not supported by backend yet.');
      return;
    }

    const payload = this.buildQuestionPayloadFromForm();
    if (!payload) return;

    this.isSavingQuestion = true;

    this.quizApi
      .addQuestion(this.quizId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSavingQuestion = false))
      )
      .subscribe({
        next: () => {
          this.resetQuestionForm();
          this.loadQuiz(this.quizId);
        },
        error: (err) => {
          console.error('addQuestion failed:', err);
        },
      });
  }

  editQuestion(q: UiQuestion): void {
    if (!this.canEditQuestions) return;

    this.editingQuestionId = q.id;

    this.questionForm.type = q.type;
    this.questionForm.questionText = q.questionText ?? '';
    this.questionForm.points = q.points ?? 1;
    this.questionForm.explanation = q.explanation ?? '';

    if (q.type === 'mcq') {
      const opts = (q.options ?? []).slice(0, 4);
      while (opts.length < 4) opts.push({ text: '' });

      this.questionForm.options = opts.map((o) => ({ text: o.text ?? '' }));
      const correctIndex = opts.findIndex((o) => !!o.isCorrect);
      this.questionForm.correctIndex = correctIndex >= 0 ? correctIndex : 0;
    }

    if (q.type === 'tf') {
      this.questionForm.tfAnswer = q.tfAnswer ?? true;
    }

    if (q.type === 'short') {
      this.questionForm.shortAnswer = q.shortAnswer ?? '';
    }

    this.activeStep = 'questions';
  }

  updateQuestion(): void {
    if (!this.quizId || !this.editingQuestionId) return;

    if (!this.canEditQuestions) {
      console.warn('Cannot edit questions in published/scheduled quiz');
      return;
    }

    if (this.questionForm.type === 'essay') {
      console.error('Essay type is not supported by backend yet.');
      return;
    }

    const payload = this.buildQuestionPayloadFromForm();
    if (!payload) return;

    this.isSavingQuestion = true;

    this.quizApi
      .updateQuestion(this.quizId, this.editingQuestionId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSavingQuestion = false))
      )
      .subscribe({
        next: () => {
          this.resetQuestionForm();
          this.loadQuiz(this.quizId);
        },
        error: (err) => {
          console.error('updateQuestion failed:', err);
        },
      });
  }

  deleteQuestion(q: UiQuestion): void {
    if (!this.quizId || !q?.id) return;

    if (!this.canEditQuestions) {
      console.warn('Cannot edit questions in published/scheduled quiz');
      return;
    }

    this.isDeletingQuestion = true;

    this.quizApi
      .deleteQuestion(this.quizId, q.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isDeletingQuestion = false))
      )
      .subscribe({
        next: () => {
          this.questions = this.questions
            .filter((x) => x.id !== q.id)
            .map((x, idx) => ({ ...x, qNo: idx + 1 }));
        },
        error: (err) => {
          console.error('deleteQuestion failed:', err);
        },
      });
  }

  private buildQuestionPayloadFromForm(): AddQuestionRequest | null {
    const prompt = (this.questionForm.questionText ?? '').trim();
    if (!prompt) return null;

    const points = Number(this.questionForm.points ?? 1) || 1;
    const explanation = (this.questionForm.explanation ?? '').trim();

    if (this.questionForm.type === 'mcq') {
      const opts = (this.questionForm.options ?? []).map((o) => (o?.text ?? '').trim());
      if (opts.length < 2 || opts.some((x) => !x)) return null;

      const correctIndex = Number(this.questionForm.correctIndex ?? 0);
      const correctText = opts[correctIndex] ?? opts[0];

      return {
        type: 'multipleChoice',
        prompt,
        options: opts.map((text, i) => ({
          label: String.fromCharCode(65 + i),
          text,
          isCorrect: i === correctIndex,
        })),
        correctAnswers: [correctText],
        points,
        explanation,
        tags: [],
        source: 'Manual',
      };
    }

    if (this.questionForm.type === 'tf') {
      const ans = this.questionForm.tfAnswer ? 'true' : 'false';
      return {
        type: 'trueFalse',
        prompt,
        correctAnswers: [ans],
        points,
        explanation,
        tags: [],
        source: 'Manual',
      };
    }

    const sample = (this.questionForm.shortAnswer ?? '').trim();
    return {
      type: 'shortAnswer',
      prompt,
      correctAnswers: sample ? [sample] : [''],
      points,
      explanation,
      tags: [],
      source: 'Manual',
    };
  }

  private resetQuestionForm(): void {
    this.editingQuestionId = null;

    this.questionForm = {
      type: 'mcq',
      questionText: '',
      options: [
        { text: 'Option A' },
        { text: 'Option B' },
        { text: 'Option C' },
        { text: 'Option D' },
      ],
      correctIndex: 0,
      points: 1,
      explanation: '',
      tfAnswer: true,
      shortAnswer: '',
    };
  }

  cancelEditQuestion(): void {
    this.resetQuestionForm();
  }

  cancel(): void {
    this.isOpen = false;
  }
}

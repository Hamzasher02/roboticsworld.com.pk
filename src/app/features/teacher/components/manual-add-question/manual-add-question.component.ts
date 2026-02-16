import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { QuizApiService } from '../../../../core/services/teacher/quiz/quiz-api.service';
import { QuizQuestion } from '../../../../core/interfaces/teacher/quiz/quiz-api';
import { ToastService } from '../../../../core/services/toast/toast.service';

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'easy' | 'medium' | 'hard';

type ManualOption = {
  label: string;
  text: string;
  correct: boolean;
};

type ManualQuestion = {
  _id?: string;
  title: string;
  type: 'mcq' | 'truefalse' | 'short';
  difficulty: Difficulty;
  points: number;
  options: ManualOption[];
  explanation: string;
  source: string;
  tags?: string;
};

@Component({
  selector: 'app-manual-add-question',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manual-add-question.component.html',
})
export class ManualAddQuestionComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly quizApi = inject(QuizApiService);
  private readonly toast = inject(ToastService);

  @Input() quizId: string | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() nextSettings = new EventEmitter<void>();

  // Loading states
  isFetchingQuestions = false;
  isAddingQuestion = false;
  isDeletingQuestion = false;

  // Questions from API
  questions: ManualQuestion[] = [];

  ngOnInit(): void {
    this.fetchQuestions();
  }

  /**
   * Fetch questions from API using getQuiz
   */
  fetchQuestions(): void {
    if (!this.quizId) {
      console.warn('[manual-add-question] No quizId provided');
      return;
    }

    this.isFetchingQuestions = true;

    this.quizApi
      .getQuiz(this.quizId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isFetchingQuestions = false))
      )
      .subscribe({
        next: (res) => {
          console.log('[SUCCESS] getQuiz response =>', res);

          if (res?.success && res?.data) {
            const apiQuestions: QuizQuestion[] = res.data.questions || [];

            // Map API questions to local format
            this.questions = apiQuestions.map((q) => ({
              _id: q._id,
              title: q.prompt,
              type: 'mcq' as const,
              difficulty: q.difficulty as Difficulty,
              points: q.points,
              options: q.options.map((o) => ({
                label: o.label,
                text: o.text,
                correct: o.isCorrect,
              })),
              explanation: q.explanation || '',
              source: q.source || 'Manual',
              tags: q.tags?.join(', ') || '',
            }));

            console.log('[INFO] Questions loaded:', this.questions.length);
          }
        },
        error: (err) => {
          console.error('[ERROR] getQuiz failed =>', err);
        },
      });
  }

  goNextSettings(): void {
    this.nextSettings.emit();
  }

  // =========================
  // ✅ ONE MODAL for Add/Edit
  // =========================
  showAddQuestionModal = false;

  isEditMode = false;
  editingIndex: number | null = null;
  editingQuestionId: string | null = null;

  addForm: {
    title: string;
    options: string[];
    correctIndex: number;
    points: number;
    difficulty: Difficulty;
    tags: string;
    explanation: string;
  } = {
      title: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      points: 1,
      difficulty: 'Easy',
      tags: '',
      explanation: '',
    };

  // ✅ OPEN ADD
  openAddQuestionModal(): void {
    this.isEditMode = false;
    this.editingIndex = null;
    this.editingQuestionId = null;
    this.resetAddForm();
    this.showAddQuestionModal = true;
  }

  // ✅ OPEN EDIT (same modal)
  openEditQuestionModal(q: ManualQuestion, index: number): void {
    this.isEditMode = true;
    this.editingIndex = index;
    this.editingQuestionId = q._id || null;

    const opts = (q.options || []).map((o) => o?.text ?? '');
    const correctIndex = Math.max(
      0,
      (q.options || []).findIndex((o) => o?.correct === true)
    );

    this.addForm = {
      title: q.title ?? '',
      options: opts.length === 4 ? [...opts] : ['', '', '', ''],
      correctIndex: correctIndex === -1 ? 0 : correctIndex,
      points: Number(q.points || 1),
      difficulty: (q.difficulty || 'Easy') as Difficulty,
      tags: (q.tags || '').toString(),
      explanation: (q.explanation || '').toString(),
    };

    this.showAddQuestionModal = true;
  }

  closeAddQuestionModal(): void {
    this.showAddQuestionModal = false;
  }

  setCorrect(i: number): void {
    this.addForm.correctIndex = i;
  }

  updateOption(index: number, value: string): void {
    if (this.addForm.options[index] !== undefined) {
      this.addForm.options[index] = value;
    }
  }

  // ✅ ONE confirm handler
  confirmQuestionModal(): void {
    // validation
    if (!this.addForm.title.trim()) {
      this.toast.warning('Question is required');
      return;
    }
    if (this.addForm.options.some((o) => !o.trim())) {
      this.toast.warning('All options are required');
      return;
    }

    if (this.isEditMode && this.editingIndex !== null) {
      this.updateQuestionApi();
      return;
    }

    this.addQuestionApi();
  }

  /**
   * Add question via API
   */
  private addQuestionApi(): void {
    if (!this.quizId) {
      this.toast.error('Quiz ID not found');
      return;
    }

    const payload = {
      type: 'multipleChoice' as const,
      prompt: this.addForm.title.trim(),
      options: this.addForm.options.map((text, i) => ({
        label: String.fromCharCode(65 + i),
        text: text.trim(),
        isCorrect: i === this.addForm.correctIndex,
      })),
      correctAnswers: [this.addForm.options[this.addForm.correctIndex].trim()],
      points: Number(this.addForm.points) || 1,
      difficulty: (this.addForm.difficulty || 'easy').toLowerCase() as any,
      explanation: this.addForm.explanation?.trim() || '',
      tags: this.addForm.tags ? this.addForm.tags.split(',').map((t) => t.trim()) : [],
      source: 'Manual',
    };

    this.isAddingQuestion = true;

    this.quizApi
      .addQuestion(this.quizId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isAddingQuestion = false))
      )
      .subscribe({
        next: (res) => {
          console.log('[SUCCESS] addQuestion response =>', res);
          this.closeAddQuestionModal();
          this.fetchQuestions(); // Refresh list
        },
        error: (err) => {
          console.error('[ERROR] addQuestion failed =>', err);
          this.toast.error(err?.error?.message ?? 'Failed to add question');
        },
      });
  }

  /**
   * Update question via API
   */
  private updateQuestionApi(): void {
    if (!this.quizId || !this.editingQuestionId) {
      this.toast.error('Quiz ID or Question ID not found');
      return;
    }

    const payload = {
      type: 'multipleChoice' as const,
      prompt: this.addForm.title.trim(),
      options: this.addForm.options.map((text, i) => ({
        label: String.fromCharCode(65 + i),
        text: text.trim(),
        isCorrect: i === this.addForm.correctIndex,
      })),
      correctAnswers: [this.addForm.options[this.addForm.correctIndex].trim()],
      points: Number(this.addForm.points) || 1,
      difficulty: (this.addForm.difficulty || 'easy').toLowerCase() as any,
      explanation: this.addForm.explanation?.trim() || '',
      tags: this.addForm.tags ? this.addForm.tags.split(',').map((t) => t.trim()) : [],
      source: 'Manual',
    };

    this.isAddingQuestion = true;

    this.quizApi
      .updateQuestion(this.quizId, this.editingQuestionId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isAddingQuestion = false))
      )
      .subscribe({
        next: (res) => {
          console.log('[SUCCESS] updateQuestion response =>', res);
          this.closeAddQuestionModal();
          this.fetchQuestions(); // Refresh list
        },
        error: (err) => {
          console.error('[ERROR] updateQuestion failed =>', err);
          this.toast.error(err?.error?.message ?? 'Failed to update question');
        },
      });
  }

  /**
   * Delete question via API
   */
  removeQuestion(index: number): void {
    const question = this.questions[index];
    if (!question?._id || !this.quizId) {
      // Local delete if no ID
      this.questions.splice(index, 1);
      return;
    }

    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    this.isDeletingQuestion = true;

    this.quizApi
      .deleteQuestion(this.quizId, question._id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isDeletingQuestion = false))
      )
      .subscribe({
        next: (res) => {
          console.log('[SUCCESS] deleteQuestion response =>', res);
          this.fetchQuestions(); // Refresh list
        },
        error: (err) => {
          console.error('[ERROR] deleteQuestion failed =>', err);
          this.toast.error(err?.error?.message ?? 'Failed to delete question');
        },
      });
  }

  private resetAddForm(): void {
    this.addForm = {
      title: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      points: 1,
      difficulty: 'Easy',
      tags: '',
      explanation: '',
    };
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // ✅ helper for list UI
  getCorrectIndex(q: ManualQuestion): number {
    const idx = (q.options || []).findIndex((o) => o.correct);
    return idx === -1 ? 0 : idx;
  }

  trackByIndex(index: number): number {
    return index;
  }
}

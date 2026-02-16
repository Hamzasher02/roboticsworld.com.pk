// create-ai-generated-quiz.component.ts
import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Difficulty = 'easy' | 'medium' | 'hard';
type QType = 'mcq' | 'tf' | 'short';

type GeneratedQuestion = {
  id: string;
  type: QType;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  points: number;

  options?: string[];
  correctIndex?: number;

  tfAnswer?: boolean;

  explanation: string;
  source: string;

  // optional (for modal)
  tags?: string;
};

type StepKey = 'setup' | 'content' | 'questions' | 'settings';

type StepItem = {
  key: StepKey;
  label: string;
  active: boolean;
  icon: string;
  iconWhite: string;
};

type OptionItem = { label: string; value: string };
type QuestionTypeKey = 'mcq' | 'tf' | 'short' | 'essay';
type QuestionTypeCard = { key: QuestionTypeKey; label: string; icon: string };

type ContentMode = 'upload' | 'prompt';

@Component({
  selector: 'app-create-ai-generated-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './create-ai-generated-quiz.component.html',
})
export class CreateAiGeneratedQuizComponent {
  header = {
    title: 'Create AI-Generated Quiz',
    subtitle: 'Build your quiz step by step',
    headerIcon: '/assets/instructor-images/quiz/Vector (3).svg',
    backIcon: '/assets/instructor-images/quiz/backarrow.svg',
  };

  private stepOrder: StepKey[] = ['setup', 'content', 'questions', 'settings'];

  steps: StepItem[] = [
    {
      key: 'setup',
      label: 'Setup',
      active: true,
      icon: '/assets/instructor-images/quiz/Vector (9).svg',
      iconWhite: '/assets/instructor-images/quiz/white1.svg',
    },
    {
      key: 'content',
      label: 'Content',
      active: false,
      icon: '/assets/instructor-images/quiz/Vector (10).svg',
      iconWhite: '/assets/instructor-images/quiz/white2.svg',
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
  ];

  activeStep: StepKey = 'setup';

  // Content step tab
  contentMode: ContentMode = 'upload';
  textPrompt = '';
  selectedFiles: File[] = [];

  // Form model
  form = {
    title: 'Quiz 1',
    category: '',
    subCategory: '',
    course: '',
    level: '',
    ageGroup: '',
    module: '',
    description: 'abc',

    learningObjectives: 'Basics',
    numberOfQuestions: 10,
    difficulty: 'easy',
    focusAreas: 'Problem Solving',

    questionTypes: new Set<QuestionTypeKey>(['mcq']),
  };

  categories: OptionItem[] = [
    { label: 'Select Category', value: '' },
    { label: 'Science', value: 'science' },
    { label: 'Math', value: 'math' },
    { label: 'Programming', value: 'programming' },
  ];
  subCategories: OptionItem[] = [
    { label: 'Select sub category', value: '' },
    { label: 'Basics', value: 'basics' },
    { label: 'Intermediate', value: 'intermediate' },
  ];
  courses: OptionItem[] = [
    { label: 'Select course', value: '' },
    { label: 'Data Science', value: 'data-science' },
    { label: 'Web Development', value: 'web-dev' },
  ];
  levels: OptionItem[] = [
    { label: 'Select level', value: '' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ];
  ageGroups: OptionItem[] = [
    { label: 'Age group', value: '' },
    { label: '10-12', value: '10-12' },
    { label: '13-15', value: '13-15' },
    { label: '16+', value: '16+' },
  ];
  modules: OptionItem[] = [
    { label: 'Select module', value: '' },
    { label: 'Module 1', value: 'm1' },
    { label: 'Module 2', value: 'm2' },
  ];
  difficulties: OptionItem[] = [
    { label: 'Easy', value: 'easy' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hard', value: 'hard' },
  ];

  questionTypeCards: QuestionTypeCard[] = [
    { key: 'mcq', label: 'Multiple Choice', icon: '/assets/instructor-images/quiz/Vector (16).svg' },
    { key: 'tf', label: 'True/False', icon: '/assets/instructor-images/quiz/Vector (15).svg' },
    { key: 'short', label: 'Short Answer', icon: '/assets/instructor-images/quiz/Vector (17).svg' },
    { key: 'essay', label: 'Essay', icon: '/assets/instructor-images/quiz/Vector (18).svg' },
  ];

  // Stepper helpers
  get activeIndex(): number {
    return this.stepOrder.indexOf(this.activeStep);
  }
  isCompletedByIndex(i: number): boolean {
    return i < this.activeIndex;
  }

  goBack(): void {
    window.history.back();
  }

  setStep(step: StepKey): void {
    this.steps = this.steps.map(s => ({ ...s, active: s.key === step }));
    this.activeStep = step;
  }

  toggleQuestionType(key: QuestionTypeKey): void {
    if (this.form.questionTypes.has(key)) this.form.questionTypes.delete(key);
    else this.form.questionTypes.add(key);

    this.form.questionTypes = new Set(this.form.questionTypes);
  }

  isSelectedType(key: QuestionTypeKey): boolean {
    return this.form.questionTypes.has(key);
  }

  // Setup -> Content
  next(): void {
    this.setStep('content');
  }

  backStep(): void {
    this.setStep('setup');
  }

  setContentMode(mode: ContentMode): void {
    this.contentMode = mode;
  }

  onChooseFiles(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.selectedFiles = files;
  }

  canGenerate(): boolean {
    if (this.contentMode === 'upload') return this.selectedFiles.length > 0;
    return this.textPrompt.trim().length > 0;
  }

  // Generated questions
  questions: GeneratedQuestion[] = [];

  // Content -> Questions
  generateWithAI(): void {
    this.questions = [
      {
        id: crypto.randomUUID(),
        type: 'mcq',
        title: 'Question 1',
        prompt: 'Based on the provided content, what is the primary concept discussed?',
        difficulty: 'medium',
        points: 2,
        options: ['Object-oriented programming', 'Data structures', 'Web development', 'Machine learning'],
        correctIndex: 0,
        explanation: 'The content primarily focuses on object-oriented programming principles.',
        source: this.contentMode === 'prompt' ? 'Text prompt' : 'Uploaded file',
        tags: '',
      },
      {
        id: crypto.randomUUID(),
        type: 'tf',
        title: 'Question 2',
        prompt: 'The concepts described in the content are applicable to modern software development.',
        difficulty: 'medium',
        points: 1,
        tfAnswer: true,
        explanation: 'The principles discussed are fundamental to current development practices.',
        source: this.contentMode === 'prompt' ? 'Text prompt' : 'Uploaded file',
        tags: '',
      },
      {
        id: crypto.randomUUID(),
        type: 'short',
        title: 'Question 3',
        prompt: 'Explain the key benefit of the main concept discussed in the content.',
        difficulty: 'medium',
        points: 3,
        explanation: 'This question assesses understanding of the practical applications.',
        source: this.contentMode === 'prompt' ? 'Text prompt' : 'AI-generated from content analysis',
        tags: '',
      },
    ];

    this.setStep('questions');
  }

  get generatedCount(): number {
    return this.questions.length;
  }

  removeQuestion(id: string): void {
    this.questions = this.questions.filter(q => q.id !== id);
    this.questions = this.questions.map((q, i) => ({ ...q, title: `Question ${i + 1}` }));
  }

  backToContent(): void {
    this.setStep('content');
  }

  nextToSettings(): void {
    this.setStep('settings');
  }

  difficultyLabel(d: Difficulty): string {
    return d;
  }

  // =========================
  // Add/Edit Modal (same UI)
  // =========================
  showAddQuestionModal = false;

  isEditMode = false;
  editingQuestionId: string | null = null;

  newQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    points: number;
    difficulty: Difficulty;
    tags: string;
    explanation: string;
  } = {
    prompt: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    points: 1,
    difficulty: 'easy',
    tags: '',
    explanation: '',
  };

  openAddQuestionModal(): void {
    this.isEditMode = false;
    this.editingQuestionId = null;
    this.resetNewQuestion();
    this.showAddQuestionModal = true;
  }

  // ✅ Edit icon click => same modal, only heading changes to "Question Editor"
  openEditQuestionModal(q: GeneratedQuestion): void {
    this.isEditMode = true;
    this.editingQuestionId = q.id;
    this.fillNewQuestionFromQuestion(q);
    this.showAddQuestionModal = true;
  }

  closeAddQuestionModal(): void {
    this.showAddQuestionModal = false;
  }

  setCorrectOption(i: number): void {
    this.newQuestion.correctIndex = i;
  }

  resetNewQuestion(): void {
    this.newQuestion = {
      prompt: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      points: 1,
      difficulty: 'easy',
      tags: '',
      explanation: '',
    };
  }

  private fillNewQuestionFromQuestion(q: GeneratedQuestion): void {
    const opts = (q.options && q.options.length === 4) ? q.options : ['', '', '', ''];

    this.newQuestion = {
      prompt: q.prompt ?? '',
      options: [...opts],
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      points: Number(q.points || 1),
      difficulty: (q.difficulty || 'easy') as Difficulty,
      tags: (q.tags || '').toString(),
      explanation: (q.explanation || '').toString(),
    };
  }

  // ✅ one confirm button handler (Add or Edit)
  confirmQuestionModal(): void {
    // basic validation
    if (!this.newQuestion.prompt.trim()) return;
    if (this.newQuestion.options.some(o => !o.trim())) return;

    if (this.isEditMode && this.editingQuestionId) {
      this.applyEditToQuestion(this.editingQuestionId);
      this.showAddQuestionModal = false;
      return;
    }

    this.addNewQuestion();
    this.showAddQuestionModal = false;
  }

  private addNewQuestion(): void {
    const n = this.questions.length + 1;

    this.questions.push({
      id: crypto.randomUUID(),
      type: 'mcq',
      title: `Question ${n}`,
      prompt: this.newQuestion.prompt.trim(),
      difficulty: this.newQuestion.difficulty,
      points: Number(this.newQuestion.points || 1),
      options: [...this.newQuestion.options],
      correctIndex: this.newQuestion.correctIndex,
      explanation: this.newQuestion.explanation?.trim() || '',
      source: 'Manual',
      tags: this.newQuestion.tags?.trim() || '',
    });

    this.questions = this.questions.map((q, i) => ({ ...q, title: `Question ${i + 1}` }));
  }

  private applyEditToQuestion(id: string): void {
    const idx = this.questions.findIndex(q => q.id === id);
    if (idx === -1) return;

    const existing = this.questions[idx];

    // ✅ keep original type (but modal is MCQ-style fields)
    // If original was not MCQ, we still update common fields + explanation/points/difficulty.
    // For MCQ, update options + correctIndex too.
    const updated: GeneratedQuestion = {
      ...existing,
      prompt: this.newQuestion.prompt.trim(),
      difficulty: this.newQuestion.difficulty,
      points: Number(this.newQuestion.points || 1),
      explanation: this.newQuestion.explanation?.trim() || '',
      tags: this.newQuestion.tags?.trim() || '',
    };

    if (existing.type === 'mcq') {
      updated.options = [...this.newQuestion.options];
      updated.correctIndex = this.newQuestion.correctIndex;
    }

    this.questions[idx] = updated;

    // keep titles consistent
    this.questions = this.questions.map((q, i) => ({ ...q, title: `Question ${i + 1}` }));
  }

  // =========================
  // Settings
  // =========================
  settings = {
    timeLimit: 10,
    attemptsAllowed: '1',
    passingScore: 10,
    showResults: 'immediately',
    randomizeOrder: true,
    allowBack: true,
    showProgress: true,
  };

  get questionCount(): number {
    return this.questions.length;
  }

  get totalPoints(): number {
    return this.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  }

  get summaryTitle(): string {
    return (this.form.title || '—').trim() || '—';
  }

  get summaryCourse(): string {
    const found = this.courses.find(c => c.value === this.form.course);
    return found?.label || '—';
  }

  get summaryDifficulty(): string {
    const d = (this.form.difficulty || '').toLowerCase();
    return d ? d : '—';
  }

  get contentSourceText(): string {
    if (this.contentMode === 'prompt') return 'Text prompt';
    const n = this.selectedFiles.length;
    return `${n} files`;
  }

  backToQuestions(): void {
    this.setStep('questions');
  }

  saveDraft(): void {
    console.log('Save as Draft', { form: this.form, settings: this.settings, questions: this.questions });
  }

  previewQuiz(): void {
    console.log('Preview Quiz', { form: this.form, settings: this.settings, questions: this.questions });
  }

  publishQuiz(): void {
    console.log('Publish Quiz', { form: this.form, settings: this.settings, questions: this.questions });
  }
}


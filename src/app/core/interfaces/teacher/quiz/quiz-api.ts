// =======================================================
// ✅ FILE 1: core/interfaces/teacher/quiz/quiz-api.ts
// (1 file me sab interfaces + types)
// =======================================================

// --------------------
// Common API wrapper
// --------------------
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: any;
}

// --------------------
// Quiz core types
// --------------------
export type QuizStatus = 'draft' | 'published' | 'scheduled' | 'pending';

export type QuizShowResults =
  | 'immediately'
  | 'later'
  | 'after_due_date'
  | 'never'
  | string;

export interface QuizSettings {
  timeLimitMinutes: number;
  attemptsAllowed: number;
  passingScorePercent: number;
  randomizeQuestions: boolean;
  allowBackNavigation: boolean;
  showProgressBar: boolean;
  showResults: QuizShowResults;
}

export type CourseRef =
  | string
  | {
      _id: string;
      courseTitle: string;
      courseThumbnail?: {
        publicId?: string;
        secureUrl?: string;
      };
    };

export type ModuleRef =
  | string
  | {
      _id: string;
    };

export interface Quiz {
  _id: string;
  title: string;

  course: CourseRef;
  module: ModuleRef | null;

  description: string;
  category: string;

  status: QuizStatus;
  publishAt: string | null;

  settings: QuizSettings;

  totalPoints: number;
  totalQuestions: number;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// --------------------
// Questions
// --------------------
export interface QuizOption {
  label: string;
  text: string;
  isCorrect: boolean;
  _id?: string;
}

export type QuizQuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  _id: string;
  quiz: string;

  type: 'multipleChoice' | 'trueFalse' | 'shortAnswer';
  prompt: string;

  options: QuizOption[];
  correctAnswers: string[];

  points: number;
  difficulty: QuizQuestionDifficulty;

  explanation: string;
  tags: string[];
  source: string;

  order: number;
  createdAt: string;
  updatedAt: string;

  tfAnswer?: boolean;
  shortAnswer?: string;
}

// --------------------
// Requests
// --------------------
export interface CreateQuizRequest {
  title: string;
  course: string;
  module?: string | null;
  description?: string;
  category?: string;
}

export interface UpdateQuizInfoRequest {
  title?: string;
  description?: string;
  category?: string;
  module?: string | null;
  course?: string;
}

export interface AddQuestionRequest {
  type: 'multipleChoice' | 'trueFalse' | 'shortAnswer';
  prompt: string;
  options?: QuizOption[];
  correctAnswers: string[];
  points: number;
  difficulty?: QuizQuestionDifficulty;
  explanation?: string;
  tags?: string[];
  source?: string;
}

export interface UpdateSettingsRequest {
  timeLimitMinutes?: number;
  attemptsAllowed?: number;
  passingScorePercent?: number;
  randomizeQuestions?: boolean;
  allowBackNavigation?: boolean;
  showProgressBar?: boolean;
  showResults?: QuizShowResults;
}

export interface SetStatusRequest {
  status: QuizStatus;
  publishAt?: string;
}

// --------------------
// Dashboard
// --------------------
export interface InstructorQuizDashboardResponse
  extends ApiResponse<InstructorQuizDashboardData> {}

export interface InstructorQuizDashboardData {
  stats: InstructorQuizDashboardStats;
  quizzes: InstructorQuizDashboardQuiz[];
}

export interface InstructorQuizDashboardStats {
  totalQuizzes: number;
  pendingDrafts: number;
  publishedQuizzes: number;
  scheduledReleases: number;
  totalAttempts: number;
  completedAttempts: number;
  averageCompletion: number;
  averageScore: number;
}

export interface InstructorQuizDashboardQuiz {
  _id: string;
  title?: string;
  status?: string;

  totalQuestions?: number;
  totalPoints?: number;

  totalAttempts?: number;
  completedAttempts?: number;

  passedStudents?: number;
  failedStudents?: number;

  averageScore?: number;

  createdAt?: string;
  publishAt?: string | null;

  course?: {
    _id?: string;
    courseTitle?: string;
  } | string;
}

// --------------------
// ✅ Summary (GET /quiz/getSummary/:quizId)
// --------------------
export interface QuizSummary {
  _id: string;
  title: string;
  status: string;
  totalPoints: number;
  totalQuestions: number;
  settings: QuizSettings;
  createdAt: string;
  publishAt?: string | null;
}

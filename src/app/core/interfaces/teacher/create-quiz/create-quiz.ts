export type QuizSettingsDto = {
  timeLimitMinutes: number;
  attemptsAllowed: number;
  passingScorePercent: number;
  randomizeQuestions: boolean;
  allowBackNavigation: boolean;
  showProgressBar: boolean;
  showResults: string;
};

export type QuizDto = {
  _id: string;
  title: string;
  course: string;
  module: string | null;
  description: string;
  category: string;
  status: string;
  publishAt: string | null;
  settings: QuizSettingsDto;
  totalPoints: number;
  totalQuestions: number;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateQuizRequest = {
  title: string;
  course: string;
  module?: string | null;
  description?: string;
  category?: string;
};

export type CreateQuizResponse = {
  success: boolean;
  message: string;
  data: QuizDto;
};

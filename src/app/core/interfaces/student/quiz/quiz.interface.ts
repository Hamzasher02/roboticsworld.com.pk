// quiz interfaces

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer';
export type AttemptStatus = 'not_started' | 'in_progress' | 'completed' | 'submitted' | 'graded';

export interface QuizQuestion {
    _id: string;
    type: 'multipleChoice' | 'trueFalse' | 'shortAnswer';
    prompt: string;
    options: {
        label: string;
        text: string;
        isCorrect: boolean;
        _id: string;
    }[];
    points: number;
    difficulty: string;
}

export interface Quiz {
    _id: string;
    title: string;
    course: {
        _id: string;
        courseTitle: string;
    };
    module: {
        _id: string;
    } | null;
    description: string;
    category: string;
    totalPoints: number;
    totalQuestions: number;
    settings: {
        timeLimitMinutes: number;
        attemptsAllowed: number;
        passingScorePercent: number;
        randomizeQuestions: boolean;
        allowBackNavigation: boolean;
        showProgressBar: boolean;
        showResults: string;
    };
    createdAt: string;
}

export interface QuizAttempt {
    attemptId: string;
    quizId: string;
    quizTitle: string;
    courseId: string;
    courseTitle: string;
    status: AttemptStatus;
    startTime: string;
    submittedAt?: string;
    gradedAt?: string;
    score?: number;
    totalMarks?: number;
    durationSeconds?: number;
    totalPoints?: number;
    createdAt?: string;
    percentage?: number;
    isPassed?: boolean;
}

export interface QuizAnswer {
    questionId: string;
    selectedAnswer?: string;
    selectedOption?: string;
    timeSpent: number;
    skipped: boolean;
}

export interface StartAttemptResponse {
    attemptId: string;
    quiz: {
        _id: string;
        title: string;
        totalQuestions: number;
        totalPoints: number;
        settings: {
            timeLimitMinutes: number;
            attemptsAllowed: number;
            passingScorePercent: number;
            randomizeQuestions: boolean;
            allowBackNavigation: boolean;
            showProgressBar: boolean;
            showResults: string;
        };
        course?: string | any;
    };
    course?: string | any;
    questions: QuizQuestion[];
}

export interface SubmitQuizRequest {
    answers: QuizAnswer[];
    completedAt: string;
}

export interface QuizResults {
    attemptId: string;
    quizId: string;
    quiz: {
        title: string;
        course: {
            _id: string;
            courseTitle: string;
        };
    };
    course?: string | any;
    totalPoints: number;
    pointsObtained: number;
    score?: number;
    percentage?: number;
    isPassed: boolean;
    answers: {
        questionId: string;
        prompt: string;
        type: QuestionType;
        selectedOption: string;
        selectedAnswer?: string;
        correctOption: string;
        isCorrect: boolean;
        pointsObtained: number;
        maxPoints: number;
        explanation: string;
        options: {
            label: string;
            text: string;
            isCorrect: boolean;
            _id: string;
        }[];
    }[];
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

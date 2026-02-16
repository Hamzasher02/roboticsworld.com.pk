/**
 * Feedback interfaces for course feedback operations.
 */

export interface CourseFeedback {
    _id: string;
    user: string | {
        _id: string;
        firstName: string;
        lastName: string;
        profilePicture?: {
            secureUrl: string;
            publicId: string;
        };
    };
    course: string | {
        _id: string;
        title: string;
    };
    rating: number; // 1-5
    feedbackText?: string;
    isApproved?: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateFeedbackRequest {
    rating: number;
    feedbackText?: string;
}

export interface UpdateFeedbackRequest {
    rating?: number;
    feedbackText?: string;
}

export interface FeedbackResponse {
    feedback: CourseFeedback;
}

export type FeedbackListResponse = CourseFeedback[];

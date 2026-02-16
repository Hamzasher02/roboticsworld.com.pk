import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../http/api-client.service';
import { ApiResponse } from '../../../http/api.types';
import {
    CourseFeedback,
    CreateFeedbackRequest,
    UpdateFeedbackRequest,
    FeedbackListResponse,
} from '../../../interfaces/student/feedback/feedback.interface';

/**
 * Service for course feedback operations.
 */
@Injectable({ providedIn: 'root' })
export class FeedbackService {
    private readonly BASE_PATH = '/coursefeedback';

    constructor(private api: ApiClientService) { }

    /**
     * Create feedback for a course.
     * POST /coursefeedback/createFeedback/:courseId
     */
    createFeedback(
        courseId: string,
        payload: CreateFeedbackRequest
    ): Observable<CourseFeedback> {
        return this.api.post<CourseFeedback>(
            `${this.BASE_PATH}/createFeedback/${courseId}`,
            payload
        );
    }

    /**
     * Get current user's feedback for a course.
     * GET /coursefeedback/getUserCourseFeedback/:courseId
     */
    getUserFeedback(courseId: string): Observable<CourseFeedback> {
        return this.api.get<CourseFeedback>(
            `${this.BASE_PATH}/getUserCourseFeedback/${courseId}`
        );
    }

    /**
     * Get all feedbacks for a course.
     * GET /coursefeedback/getCourseFeedbacks/:courseId
     */
    getCourseFeedbacks(courseId: string): Observable<FeedbackListResponse> {
        return this.api.get<FeedbackListResponse>(
            `${this.BASE_PATH}/getCourseFeedbacks/${courseId}`
        );
    }

    /**
     * Update existing feedback.
     * PATCH /coursefeedback/updateFeedback/:feedbackId
     */
    updateFeedback(
        feedbackId: string,
        payload: UpdateFeedbackRequest
    ): Observable<CourseFeedback> {
        return this.api.patch<CourseFeedback>(
            `${this.BASE_PATH}/updateFeedback/${feedbackId}`,
            payload
        );
    }

    /**
     * Delete feedback.
     * DELETE /coursefeedback/deleteFeedback/:feedbackId
     */
    deleteFeedback(feedbackId: string): Observable<ApiResponse<void>> {
        return this.api.deleteFullResponse<void>(
            `${this.BASE_PATH}/deleteFeedback/${feedbackId}`
        );
    }
}


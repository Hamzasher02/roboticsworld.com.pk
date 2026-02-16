import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from '../../../http/api-client.service';
import {
    CourseSession,
    SessionsResponse,
} from '../../../interfaces/student/sessions/sessions.interface';

/**
 * Service for course session operations based on documentation.
 */
@Injectable({ providedIn: 'root' })
export class SessionsService {
    private readonly BASE_PATH = '/coursesession/student';

    constructor(private api: ApiClientService) { }

    /**
     * Get all sessions for current student.
     * GET /coursesession/student/my-sessions
     */
    getMySessions(filters?: {
        page?: number;
        limit?: number;
        status?: string;
        courseId?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Observable<SessionsResponse> {
        let url = `${this.BASE_PATH}/my-sessions`;
        if (filters) {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value.toString());
            });
            const queryString = params.toString();
            if (queryString) url += `?${queryString}`;
        }
        return this.api.get<SessionsResponse>(url);
    }

    /**
     * Get sessions for a specific enrollment.
     * GET /coursesession/student/enrollment/:enrollmentId/sessions
     */
    getEnrollmentSessions(enrollmentId: string): Observable<any> {
        return this.api.get<any>(`${this.BASE_PATH}/enrollment/${enrollmentId}/sessions`).pipe(
            map(res => {
                // Return just the array of sessions if meaningful
                return res.data || [];
            })
        );
    }
}


import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface GetAllSessionsResponse {
    success: boolean;
    message: string;
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    }
}

@Injectable({
    providedIn: 'root'
})
export class CourseSessionService {
    private apiUrl = `${environment.apiBaseUrl}/coursesession`;

    constructor(private http: HttpClient) { }

    getAllSessions(page: number = 1, limit: number = 10, status?: string): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString())
            .set('isSessionAssigned', 'false')
            .set('status', 'approved');

        return this.http.get<any>(`${environment.apiBaseUrl}/enrollment/admin/getAllEnrollments`, {
            params,
            withCredentials: true
        });
    }

    getSingleSession(enrollmentId: string): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}/enrollment/getSingleEnrollment/${enrollmentId}`, {
            withCredentials: true
        });
    }

    createSession(sessionData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/createSession`, sessionData, {
            withCredentials: true
        });
    }
}

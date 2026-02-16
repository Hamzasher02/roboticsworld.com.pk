import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface StudentProgressItem {
    studentId: string;
    studentName: string;
    email: string;
    courseId: string;
    courseTitle: string;
    subscription: string;
    enrollmentDate: string;
    progressPercentage: number;
    enrollmentId: string;
}

export interface GetAllStudentProgressResponse {
    success: boolean;
    message: string;
    data: StudentProgressItem[];
}

@Injectable({
    providedIn: 'root'
})
export class StudentProgressService {
    private apiUrl = `${environment.apiBaseUrl}/studentprogress`;

    constructor(private http: HttpClient) { }

    getAllStudentProgress(): Observable<GetAllStudentProgressResponse> {
        return this.http.get<GetAllStudentProgressResponse>(`${this.apiUrl}/getAllStudentProgress`, {
            withCredentials: true
        });
    }
}

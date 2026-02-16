import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface DemoSessionRequest {
    _id: string;
    studentId: string;
    category: string;
    subcategory: string;
    courseId: string;
    preferredDate: string;
    preferredTime: string;
    status: string;
    rejectReason: string | null;
    instructorId: string;
    demoSessionLink: string;
    approvedDate: string | null;
    approvedBy: any;
    rejectedBy: any;
    rejectedAt: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    deletedBy: any;
    restoredAt: string | null;
    restoredBy: any;
    createdAt: string;
    updatedAt: string;
    student: {
        profilePicture?: {
            secureUrl: string;
            publicId: string;
        };
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        student: {
            _id: string;
            parentPhoneNumber: string;
            grade: string;
            age: number;
            createdBy: string;
        };
        id: string;
    };
    course: {
        courseThumbnail?: {
            publicId: string;
            secureUrl: string;
        };
        _id: string;
        courseTitle: string;
        courseCategory: string[];
        courseSubCategory: string;
        courseAgeGroup: string;
        courseLevel: string;
        courseAccess: string;
        coursePrice: string;
    };
    instructor: {
        profilePicture?: {
            secureUrl: string;
            publicId: string;
        };
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        id: string;
    };
    id: string;
}

export interface GetAllDemoSessionsResponse {
    success: boolean;
    message: string;
    data: DemoSessionRequest[];
}

@Injectable({
    providedIn: 'root'
})
export class DemoSessionService {
    private apiUrl = `${environment.apiBaseUrl}/demosession`;

    constructor(private http: HttpClient) { }

    getAllDemoSessionRequests(): Observable<GetAllDemoSessionsResponse> {
        return this.http.get<GetAllDemoSessionsResponse>(`${this.apiUrl}/getAllDemoSessionRequests`, {
            withCredentials: true
        });
    }

    approveAndAssignInstructor(requestId: string, data: { instructorId: string, demoSessionLink: string }): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/approveAndAssignInstructor/${requestId}`, data, {
            withCredentials: true
        });
    }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetAllEnrollmentsResponse } from '../../../interfaces/admin/enrollment.interface';

@Injectable({
    providedIn: 'root'
})
export class EnrollmentService {
    private apiUrl = `${environment.apiBaseUrl}/enrollment/admin`;

    constructor(private http: HttpClient) { }

    getAllEnrollments(): Observable<GetAllEnrollmentsResponse> {
        return this.http.get<GetAllEnrollmentsResponse>(`${this.apiUrl}/getAllEnrollments`, {
            withCredentials: true
        });
    }

    updateEnrollmentStatus(enrollmentId: string, status: 'approved' | 'rejected'): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/updateEnrollmentStatus/${enrollmentId}`, { status }, {
            withCredentials: true
        });
        console.log(enrollmentId, status);
    }

    getSingleEnrollment(enrollmentId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/getSingleEnrollment/${enrollmentId}`, {
            withCredentials: true
        });
    }
}

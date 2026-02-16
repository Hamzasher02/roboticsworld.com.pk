import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface CreateEnrollmentResponse {
    success: boolean;
    message: string;
    data: any;
}

@Injectable({
    providedIn: 'root'
})
export class StudentEnrollmentService {
    private readonly BASE_URL = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    /**
     * Create a new enrollment (POST /enrollment/createEnrollment/:courseId)
     */
    createEnrollment(courseId: string, paymentScreenshot: File, data: {
        enrollmentType: string;
        selectedTimeSlot?: string;
        invoiceNumber?: string;
    }): Observable<CreateEnrollmentResponse> {
        const formData = new FormData();
        formData.append('paymentScreenshot', paymentScreenshot);

        // Map enrollmentType to backend expected values
        const backendEnrollmentType = data.enrollmentType === 'Recorded Lectures'
            ? 'Recorded Lectures'
            : 'Live Classes';
        formData.append('enrollmentType', backendEnrollmentType);

        // preferredClassTime is required only for Live Classes
        if (backendEnrollmentType === 'Live Classes' && data.selectedTimeSlot) {
            formData.append('preferredClassTime', data.selectedTimeSlot);
        }
        if (data.invoiceNumber) {
            formData.append('invoiceNumber', data.invoiceNumber);
        }

        return this.http.post<CreateEnrollmentResponse>(
            `${this.BASE_URL}/enrollment/createEnrollment/${courseId}`,
            formData,
            {
                withCredentials: true
            }
        );
    }
}

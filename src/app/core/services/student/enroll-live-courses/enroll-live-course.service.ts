import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CreateEnrollmentResponse, EnrollLiveCourse } from '../../../interfaces/student/enroll-live-courses/enroll-live-course';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnrollLiveCourseService {

  private apiBaseUrl = environment.apiBaseUrl;

  // ✅ Start EMPTY
  private enrollmentData$ = new BehaviorSubject<EnrollLiveCourse | null>(null);

  constructor(private http: HttpClient) { }

  // CALLED ON "BUY NOW"

  setCourseId(courseId: string): void {
    this.enrollmentData$.next({ courseId });
  }

  // USED BY STEP COMPONENTS 
  getEnrollmentData(): EnrollLiveCourse | null {
    return this.enrollmentData$.getValue();
  }

  updateEnrollmentData(data: Partial<EnrollLiveCourse>): void {
    const current = this.enrollmentData$.getValue();
    if (!current) return;

    this.enrollmentData$.next({ ...current, ...data });
  }

  // STEP-3 FINAL API CALL 
  createEnrollment(): Observable<CreateEnrollmentResponse> {
    const enrollment = this.enrollmentData$.getValue();
    if (!enrollment) {
      throw new Error('Enrollment data missing');
    }

    const formData = new FormData();
    formData.append('courseId', enrollment.courseId);

    if (enrollment.enrollmentType)
      formData.append('enrollmentType', enrollment.enrollmentType);

    if (enrollment.preferredClassTime)
      formData.append('preferredClassTime', enrollment.preferredClassTime);

    if (enrollment.invoiceNumber)
      formData.append('invoiceNumber', enrollment.invoiceNumber);

    if (enrollment.paymentScreenshot)
      formData.append('paymentScreenshot', enrollment.paymentScreenshot);

    return this.http.post<CreateEnrollmentResponse>(
      `${this.apiBaseUrl}/enrollment/createEnrollment/${enrollment.courseId}`,
      formData
    );
  }

  reset(): void {
    this.enrollmentData$.next(null);
  }
}

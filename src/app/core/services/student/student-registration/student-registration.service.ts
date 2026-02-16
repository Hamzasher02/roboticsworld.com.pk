import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  StudentRegisterPayload,
  StudentRegisterResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
  StudentAuthError,
} from '../../../interfaces/student/student-registration/student-registration';

/**
 * Student-specific registration and email verification service.
 * 
 * IMPORTANT: This service is completely separate from instructor auth.
 * It does NOT modify any shared auth logic or instructor endpoints.
 * 
 * Follows the same proven patterns as InstructorRegisterService:
 * - FormData builder (no manual Content-Type header)
 * - withCredentials: true for cookie-based auth
 * - Proper error handling
 */
@Injectable({ providedIn: 'root' })
export class StudentRegistrationService {
  private readonly BASE_URL = environment.apiBaseUrl.replace(/\/$/, '');
  private readonly REGISTER_STUDENT_URL = `${this.BASE_URL}/auth/register/student`;
  private readonly VERIFY_EMAIL_URL = `${this.BASE_URL}/auth/verifyEmailAddress`;

  constructor(private http: HttpClient) { }

  /**
   * Register a new student account.
   * POST /auth/register/student (multipart/form-data)
   */
  registerStudent(payload: StudentRegisterPayload): Observable<StudentRegisterResponse> {
    const fd = this.toFormData(payload);

    // DEBUG: Log FormData contents
    console.log('[StudentRegistrationService] Sending Registration Request to:', this.REGISTER_STUDENT_URL);
    fd.forEach((value, key) => {
      // hide password in logs
      if (key === 'password') console.log(`FormData: ${key} = [REDACTED]`);
      else if (key === 'profilePicture') console.log(`FormData: ${key} = [File]`);
      else console.log(`FormData: ${key} =`, value);
    });

    return this.http
      .post<StudentRegisterResponse>(this.REGISTER_STUDENT_URL, fd)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          // Re-throwing normalized error to keep Component compatible
          return throwError(() => this.toAuthError(err));
        })
      );
  }

  /**
   * Verify email address with OTP code.
   * POST /auth/verifyEmailAddress
   */
  verifyEmail(payload: VerifyEmailPayload): Observable<VerifyEmailResponse> {
    return this.http
      .post<VerifyEmailResponse>(this.VERIFY_EMAIL_URL, payload)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return throwError(() => this.toAuthError(err));
        })
      );
  }

  /**
   * Resend OTP to email.
   */
  resendOtp(email: string): Observable<{ success: boolean; message: string }> {
    const resendUrl = `${this.BASE_URL}/auth/resendOtp`;
    return this.http
      .post<{ success: boolean; message: string }>(resendUrl, { email })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return throwError(() => this.toAuthError(err));
        })
      );
  }

  // ─────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────

  private toFormData(payload: StudentRegisterPayload): FormData {
    const fd = new FormData();

    // Personal
    fd.append('firstName', payload.firstName);
    fd.append('lastName', payload.lastName);
    fd.append('fatherName', payload.fatherName);
    fd.append('email', payload.email);
    fd.append('password', payload.password);
    fd.append('phoneNumber', payload.phoneNumber);
    fd.append('dateOfBirth', payload.dateOfBirth);
    fd.append('bio', payload.bio);

    // Meta
    fd.append('consentAccepted', String(payload.consentAccepted));

    // Student Specific
    fd.append('parentPhoneNumber', payload.parentPhoneNumber);
    fd.append('ageGroup', payload.ageGroup);
    fd.append('age', String(payload.age));

    // Residence
    fd.append('address', payload.address);
    fd.append('city', payload.city);
    fd.append('country', payload.country);
    fd.append('postalCode', String(payload.postalCode));

    // Emergency
    fd.append('fullName', payload.fullName);
    fd.append('relationship', payload.relationship);
    fd.append('emergencyPhoneNumber', payload.emergencyPhoneNumber);

    // Optional profile picture
    if (payload.profilePicture) {
      fd.append('profilePicture', payload.profilePicture);
    }

    return fd;
  }

  private toAuthError(error: HttpErrorResponse): StudentAuthError {
    return {
      success: false,
      statusCode: error.status || 0,
      message: error.error?.message || error.message || 'Unknown error',
      errors: error.error?.errors,
      raw: error.error,
    };
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
    ForgotPasswordRequest,
    VerifyOtpRequest,
    ResetPasswordRequest,
    ForgotPasswordResponse
} from '../../interfaces/steam-mind/forgot-password';

@Injectable({ providedIn: 'root' })
export class ForgotPasswordService {
    private readonly AUTH_URL = `${environment.apiBaseUrl}/auth`;

    constructor(private http: HttpClient) { }

    /**
     * Step 1: Send OTP to email
     * POST /auth/forgotPassword
     */
    sendOtp(payload: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
        return this.http
            .post<ForgotPasswordResponse>(`${this.AUTH_URL}/forgotPassword`, payload)
            .pipe(catchError(this.handleError));
    }

    /**
     * Step 2: Verify initial OTP
     * POST /auth/verifyInitialOtp
     */
    verifyOtp(payload: VerifyOtpRequest): Observable<ForgotPasswordResponse> {
        return this.http
            .post<ForgotPasswordResponse>(`${this.AUTH_URL}/verifyInitialOtp`, payload)
            .pipe(catchError(this.handleError));
    }

    /**
     * Step 3: Reset password with OTP
     * POST /auth/resetPasswordWithOtp
     */
    resetPassword(payload: ResetPasswordRequest): Observable<ForgotPasswordResponse> {
        return this.http
            .post<ForgotPasswordResponse>(`${this.AUTH_URL}/resetPasswordWithOtp`, payload)
            .pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        // Return the actual error message from backend if available
        return throwError(() => error);
    }
}

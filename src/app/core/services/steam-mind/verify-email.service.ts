import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { VerifyEmailPayload, VerifyEmailResponse } from '../../interfaces/steam-mind/verify-email';

@Injectable({ providedIn: 'root' })
export class VerifyEmailService {
  private readonly BASE_URL = environment.apiBaseUrl.replace(/\/$/, '');
  private readonly VERIFY_URL = `${this.BASE_URL}/auth/verifyEmailAddress`;

  constructor(private http: HttpClient) {}

  verifyEmail(payload: VerifyEmailPayload): Observable<VerifyEmailResponse> {
    return this.http.post<VerifyEmailResponse>(this.VERIFY_URL, payload).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
}

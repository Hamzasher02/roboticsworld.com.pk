import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ChangePasswordRequest, ChangePasswordResponse } from '../../interfaces/steam-mind/change-password';

@Injectable({ providedIn: 'root' })
export class StudentChangePasswordService {
  private readonly CHANGE_PASSWORD_URL = `${environment.apiBaseUrl}/user/changePassword`;

  constructor(private http: HttpClient) {}

  changePassword(payload: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.http
      .patch<ChangePasswordResponse>(this.CHANGE_PASSWORD_URL, payload, {
        withCredentials: true, // ✅ cookies/JWT ke liye
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}

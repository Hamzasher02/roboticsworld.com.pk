import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ChangePasswordRequest, ChangePasswordResponse } from '../../../../core/interfaces/steam-mind/change-password/change-password';

@Injectable({ providedIn: 'root' })
export class ChangePasswordService {
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

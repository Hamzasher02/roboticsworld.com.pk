import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../../../../environments/environment';
import { ApiError, LoginRequest, LoginResponse, LoginUser, MeResponse } from '../../../interfaces/steam-mind/login/login';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly LOGIN_URL = `${environment.apiBaseUrl}/auth/login/users`;
  private readonly ME_URL = `${environment.apiBaseUrl}/user/showCurrentUser`; // ✅ tumhara endpoint
  private readonly LOGOUT_URL = `${environment.apiBaseUrl}/auth/logout`;

  private readonly _isAuthed$ = new BehaviorSubject<boolean>(this.hasStoredUser());
  readonly isAuthed$ = this._isAuthed$.asObservable();

  private readonly _user$ = new BehaviorSubject<LoginUser | null>(this.getStoredUser());
  readonly user$ = this._user$.asObservable();

  constructor(private http: HttpClient) { }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.LOGIN_URL, payload, { withCredentials: true })
      .pipe(
        tap((res: LoginResponse) => {
          const user = this.pickUserFromLogin(res);
          if (user) {
            this._isAuthed$.next(true);
            this._user$.next(user);
            this.persistUser(user);
          } else {
            this.markLoggedOut();
          }
        }),
        catchError((err: HttpErrorResponse) => {
          this.markLoggedOut();
          return throwError(() => this.toApiError(err));
        })
      );
  }

  ensureSession(): Observable<boolean> {
    return this.http
      .get<MeResponse>(this.ME_URL, { withCredentials: true })
      .pipe(
        map((res: MeResponse) => {
          const user = this.pickUserFromMe(res);
          if (res?.success && user) {
            this._isAuthed$.next(true);
            this._user$.next(user);
            this.persistUser(user);
            return true;
          }
          this.markLoggedOut();
          return false;
        }),
        catchError(() => {
          this.markLoggedOut();
          return of(false);
        })
      );
  }

  logout(): Observable<boolean> {
    return this.http
      .get<any>(this.LOGOUT_URL, { withCredentials: true })
      .pipe(
        map(() => true),
        tap(() => this.markLoggedOut()),
        catchError(() => {
          this.markLoggedOut();
          return of(true);
        })
      );
  }

  // -------- helpers --------
  private pickUserFromLogin(res: LoginResponse): LoginUser | null {
    return res?.data?.[0] ?? null;
  }

  private pickUserFromMe(res: MeResponse): LoginUser | null {
    const d: any = res?.data;
    if (!d) return null;
    return Array.isArray(d) ? (d[0] ?? null) : d;
  }

  private persistUser(user: LoginUser): void {
    localStorage.setItem('role', user.role);
    localStorage.setItem('sm_user', JSON.stringify(user));
  }

  private getStoredUser(): LoginUser | null {
    try {
      const raw = localStorage.getItem('sm_user');
      return raw ? (JSON.parse(raw) as LoginUser) : null;
    } catch {
      return null;
    }
  }

  private hasStoredUser(): boolean {
    return !!localStorage.getItem('sm_user');
  }

  private markLoggedOut(): void {
    this._isAuthed$.next(false);
    this._user$.next(null);
    localStorage.removeItem('role');
    localStorage.removeItem('sm_user');

    // Clear all cookies
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  }

  private toApiError(error: HttpErrorResponse): ApiError {
    return {
      success: false,
      statusCode: error.status || 0,
      message:
        (error.error && (error.error.message || error.error?.error)) ||
        error.message ||
        'Something went wrong',
      raw: error.error,
    };
  }
}

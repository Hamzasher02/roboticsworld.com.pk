import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { ApiError, LoginRequest, LoginResponse, LoginUser, MeResponse } from '../../interfaces/steam-mind/login';

/**
 * Student registration request interface.
 */
export interface StudentRegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  profilePicture?: File;
}

/**
 * Registration response interface.
 */
export interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    user?: LoginUser;
    verificationRequired?: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE_URL = environment.apiBaseUrl.replace(/\/$/, '');
  private readonly LOGIN_URL = `${this.BASE_URL}/auth/login/users`;
  private readonly REGISTER_STUDENT_URL = `${this.BASE_URL}/auth/register/student`;
  private readonly VERIFY_EMAIL_URL = `${this.BASE_URL}/auth/verifyEmailAddress`;
  private readonly ME_URL = `${this.BASE_URL}/user/showCurrentUser`;
  private readonly LOGOUT_URL = `${this.BASE_URL}/auth/logout`;

  private readonly _isAuthed$ = new BehaviorSubject<boolean>(this.hasStoredUser());
  readonly isAuthed$ = this._isAuthed$.asObservable();

  private readonly _user$ = new BehaviorSubject<LoginUser | null>(this.getStoredUser());
  readonly user$ = this._user$.asObservable();

  constructor(private http: HttpClient) { }

  // ─────────────────────────────────────────────────────────────
  // Authentication Methods
  // ─────────────────────────────────────────────────────────────

  /**
   * Login with email and password.
   * POST /auth/login/users
   */
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

  /**
   * Register a new student account.
   * POST /auth/register/student (multipart/form-data)
   */
  registerStudent(payload: StudentRegistrationPayload): Observable<RegistrationResponse> {
    const formData = new FormData();
    formData.append('firstName', payload.firstName);
    formData.append('lastName', payload.lastName);
    formData.append('email', payload.email);
    formData.append('password', payload.password);

    if (payload.phone) {
      formData.append('phone', payload.phone);
    }
    if (payload.profilePicture) {
      formData.append('profilePicture', payload.profilePicture);
    }

    return this.http
      .post<RegistrationResponse>(this.REGISTER_STUDENT_URL, formData, { withCredentials: true })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return throwError(() => this.toApiError(err));
        })
      );
  }

  /**
   * Verify email address with verification code.
   * POST /auth/verifyEmailAddress
   */
  verifyEmail(email: string, verificationCode: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(
        this.VERIFY_EMAIL_URL,
        { email, verificationCode },
        { withCredentials: true }
      )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return throwError(() => this.toApiError(err));
        })
      );
  }

  /**
   * Validate current session and refresh user data.
   * GET /user/showCurrentUser
   */
  ensureSession(): Observable<boolean> {
    return this.http
      .get<MeResponse>(this.ME_URL, { withCredentials: true })
      .pipe(
        map((res: MeResponse) => {
          const newUser = this.pickUserFromMe(res);
          if (res?.success && newUser) {
            // ✅ Merge strategy: Keep existing rich data (names/image) if the new session object is lean/partial
            // This fixes the issue where /showCurrentUser might return less data than /login
            const currentUser = this._user$.value;
            const mergedUser: LoginUser = {
              ...newUser,
              firstName: newUser.firstName || currentUser?.firstName || '',
              lastName: newUser.lastName || currentUser?.lastName || '',
              profilePicture: newUser.profilePicture || currentUser?.profilePicture || '',
              // Ensure we don't lose the role or email if they match
              role: newUser.role || currentUser?.role || '',
              email: newUser.email || currentUser?.email || ''
            };

            this._isAuthed$.next(true);
            this._user$.next(mergedUser);
            this.persistUser(mergedUser);
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

  /**
   * Manually update the current user state with partial data.
   * Useful when profile is updated in another component and we want to reflect changes immediately.
   */
  updateUser(partialUser: Partial<LoginUser>): void {
    const currentUser = this._user$.value;
    if (currentUser) {
      const updatedUser: LoginUser = { ...currentUser, ...partialUser };
      this._user$.next(updatedUser);
      this.persistUser(updatedUser);
    }
  }

  /**
   * Logout and clear session.
   * GET /auth/logout
   */
  logout(): Observable<boolean> {
    return this.http
      .get<unknown>(this.LOGOUT_URL, { withCredentials: true })
      .pipe(
        map(() => true),
        tap(() => this.markLoggedOut()),
        catchError(() => {
          this.markLoggedOut();
          return of(true);
        })
      );
  }

  // ─────────────────────────────────────────────────────────────
  // User & Role Helpers
  // ─────────────────────────────────────────────────────────────

  /**
   * Get current user synchronously.
   */
  getCurrentUser(): LoginUser | null {
    return this._user$.value;
  }

  /**
   * Get current user's role.
   */
  getUserRole(): string | null {
    return this._user$.value?.role || localStorage.getItem('role');
  }

  /**
   * Check if current user has a specific role.
   */
  hasRole(role: string | string[]): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;

    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }

  /**
   * Check if user is a student.
   */
  isStudent(): boolean {
    return this.hasRole('student');
  }

  /**
   * Check if user is an instructor.
   */
  isInstructor(): boolean {
    return this.hasRole('instructor');
  }

  /**
   * Check if user is an admin.
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is authenticated.
   */
  isAuthenticated(): boolean {
    return this._isAuthed$.value;
  }

  // ─────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────

  private pickUserFromLogin(res: LoginResponse): LoginUser | null {
    const d: any = res?.data;
    if (!d) return null;
    const rawUser = Array.isArray(d) ? (d[0] ?? null) : d;
    return this.normalizeUser(rawUser);
  }

  private pickUserFromMe(res: MeResponse): LoginUser | null {
    const d: unknown = res?.data;
    if (!d) return null;
    const rawUser = Array.isArray(d) ? (d[0] ?? null) : d;
    return this.normalizeUser(rawUser);
  }

  private normalizeUser(user: any): LoginUser | null {
    if (!user) return null;
    const u = { ...user };
    if (u.profilePicture && typeof u.profilePicture === 'object' && u.profilePicture.secureUrl) {
      u.profilePicture = u.profilePicture.secureUrl;
    }
    return u as LoginUser;
  }

  // ─────────────────────────────────────────────────────────────
  // Cookie Management Helpers
  // ─────────────────────────────────────────────────────────────

  private setCookie(name: string, value: string, days?: number): void {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  private deleteCookie(name: string): void {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  private persistUser(user: LoginUser): void {
    localStorage.setItem('role', user.role);
    // ✅ Store rich user data in localStorage to avoid cookie size limits/issues
    localStorage.setItem('sm_user_data', JSON.stringify(user));

    // Keep minimal cookie for legacy/edge support if needed, or just role
    this.setCookie('role', user.role, 7);
    this.setCookie('sm_user', encodeURIComponent(JSON.stringify(user)), 7);
  }

  private getStoredUser(): LoginUser | null {
    try {
      // ✅ Try localStorage first (Primary Source)
      const localData = localStorage.getItem('sm_user_data');
      if (localData) {
        return JSON.parse(localData) as LoginUser;
      }

      // Fallback to cookie
      const raw = this.getCookie('sm_user');
      if (!raw) return null;
      const decoded = raw.includes('%') ? decodeURIComponent(raw) : raw;
      const user = JSON.parse(decoded) as LoginUser;
      return user;
    } catch (e) {
      return null;
    }
  }

  private hasStoredUser(): boolean {
    return !!this.getCookie('sm_user');
  }

  private markLoggedOut(): void {
    this._isAuthed$.next(false);
    this._user$.next(null);
    localStorage.removeItem('role');
    localStorage.removeItem('sm_user_data'); // ✅ Clear new storage
    this.deleteCookie('role');
    this.deleteCookie('sm_user');
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

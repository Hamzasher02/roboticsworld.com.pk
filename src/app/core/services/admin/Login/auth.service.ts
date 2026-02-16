import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { LoginRequest, LoginResponse, LoginUserData } from '../../../interfaces/admin/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE_URL = environment.apiBaseUrl.replace(/\/$/, '');

  private readonly LOGIN_URL = `${this.BASE_URL}/auth/login/staff`;

  // ✅ your existing endpoint
  private readonly ME_URL = `${this.BASE_URL}/user/showCurrentUser`;

  private readonly LOGOUT_URL = `${this.BASE_URL}/auth/logout`;

  private readonly _isAuthed$ = new BehaviorSubject<boolean>(false);
  readonly isAuthed$ = this._isAuthed$.asObservable();

  private readonly _user$ = new BehaviorSubject<LoginUserData | null>(null);
  readonly user$ = this._user$.asObservable();

  private _sessionCheck$?: Observable<boolean>;

  constructor(private http: HttpClient) {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const profilePicture = localStorage.getItem('profile');

    if (role && email && name) {
      const parts = name.split(' ');
      this._isAuthed$.next(true);
      this._user$.next({
        email,
        role,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        profilePicture: profilePicture ?? ''
      });
    }
  }

  /** ✅ normalize: login response -> LoginUserData (ONLY improved name extraction) */
  private pickUserFromLogin(res: any): LoginUserData | null {
    const raw = Array.isArray(res?.data) ? res.data[0] : res?.data;

    // common nesting patterns
    const u = raw?.user ?? raw?.staff ?? raw?.currentUser ?? raw;

    const role = u?.role ?? u?.userRole ?? u?.type ?? u?.accountType ?? '';

    // ✅ most backends provide "name" or "fullName"
    const fullName =
      u?.name ??
      u?.fullName ??
      u?.full_name ??
      u?.username ??
      u?.displayName ??
      '';

    let firstName = u?.firstName ?? u?.first_name ?? u?.firstname ?? '';
    let lastName = u?.lastName ?? u?.last_name ?? u?.lastname ?? '';

    // ✅ if first/last missing but fullName exists -> split
    if ((!firstName || !lastName) && fullName) {
      const parts = String(fullName).trim().split(/\s+/);
      if (!firstName) firstName = parts[0] ?? '';
      if (!lastName) lastName = parts.slice(1).join(' ') ?? '';
    }

    const email = u?.email ?? '';
    const profilePicture = u?.profilePicture?.secureUrl ?? u?.profilePicture ?? '';

    if (!role && !firstName && !lastName && !fullName && !email) return null;

    return {
      email: String(email),
      role: String(role),
      firstName: String(firstName),
      lastName: String(lastName),
      profilePicture: String(profilePicture)
    };
  }

  /** ✅ normalize: me response -> LoginUserData (ONLY improved name extraction) */
  private pickUserFromMe(res: any): LoginUserData | null {
    const raw = res?.data ?? res;

    const u =
      raw?.user ??
      raw?.staff ??
      raw?.currentUser ??
      raw?.data ?? // sometimes nested again
      raw;

    const role = u?.role ?? u?.userRole ?? u?.type ?? u?.accountType ?? '';

    const fullName =
      u?.name ??
      u?.fullName ??
      u?.full_name ??
      u?.username ??
      u?.displayName ??
      '';

    let firstName = u?.firstName ?? u?.first_name ?? u?.firstname ?? '';
    let lastName = u?.lastName ?? u?.last_name ?? u?.lastname ?? '';

    if ((!firstName || !lastName) && fullName) {
      const parts = String(fullName).trim().split(/\s+/);
      if (!firstName) firstName = parts[0] ?? '';
      if (!lastName) lastName = parts.slice(1).join(' ') ?? '';
    }

    const email = u?.email ?? '';
    const profilePicture = u?.profilePicture?.secureUrl ?? u?.profilePicture ?? '';

    if (!role && !firstName && !lastName && !fullName && !email) return null;

    return {
      email: String(email),
      role: String(role),
      firstName: String(firstName),
      lastName: String(lastName),
      profilePicture: String(profilePicture)
    };
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.LOGIN_URL, payload, { withCredentials: true })
      .pipe(
        tap((res: any) => {
          const user = this.pickUserFromLogin(res);

          this._isAuthed$.next(true);
          this._user$.next(user);

          if (user) this.persistUser(user);
        }),
        catchError((err: HttpErrorResponse) => {
          this.markLoggedOut();
          return throwError(() => err);
        })
      );
  }

  ensureSession(force = false): Observable<boolean> {
    if (!force && this._isAuthed$.value) return of(true);
    if (!force && this._sessionCheck$) return this._sessionCheck$;

    this._sessionCheck$ = this.http
      .get<any>(this.ME_URL, { withCredentials: true })
      .pipe(
        tap((res) => {
          // success flag can differ; we rely on user extraction
          const user = this.pickUserFromMe(res);

          if (user) {
            this._isAuthed$.next(true);
            this._user$.next(user);
            this.persistUser(user);
          } else {
            this.markLoggedOut();
          }
        }),
        map((res) => {
          const user = this.pickUserFromMe(res);
          const ok = res?.success === true || res?.status === 'success' || !!user;
          return !!ok && !!user;
        }),
        catchError(() => {
          this.markLoggedOut();
          return of(false);
        }),
        finalize(() => (this._sessionCheck$ = undefined)),
        shareReplay(1)
      );

    return this._sessionCheck$;
  }

  logout(): Observable<boolean> {
    return this.http.get(this.LOGOUT_URL, { withCredentials: true }).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => this.markLoggedOut())
    );
  }

  markLoggedOut(): void {
    this._isAuthed$.next(false);
    this._user$.next(null);
    this.clearPersistedUser();
  }

  /** ✅ ONLY change: name persist more reliable, NO flow change */
  private persistUser(user: Partial<LoginUserData>) {
    if (user.role) {
      localStorage.setItem('role', user.role);
    }
    if (user.email) localStorage.setItem('email', user.email);
    if (user.profilePicture) localStorage.setItem('profile', user.profilePicture);

    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    if (fullName) localStorage.setItem('name', fullName);
  }

  private clearPersistedUser() {
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('profile');
    localStorage.removeItem('name');
  }
}

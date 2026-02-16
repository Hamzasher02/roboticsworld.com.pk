import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../../environments/environment';
import { GetAllRolesResponse, Role } from '../../../interfaces/admin/get-role';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly BASE = environment.apiBaseUrl;
  private readonly GET_ALL_ROLES_URL = `${this.BASE}/role/getAllRoles`;

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<Role[]> {
    return this.http
      .get<GetAllRolesResponse>(this.GET_ALL_ROLES_URL, { withCredentials: true })
      .pipe(
        map((res) => res?.data ?? []),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    const msg =
      (error.error && (error.error.message || error.error.error)) ||
      error.message ||
      'Request failed';
    return throwError(() => new Error(msg));
  }
}

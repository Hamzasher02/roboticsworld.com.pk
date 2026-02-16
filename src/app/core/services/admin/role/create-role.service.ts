import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../../environments/environment';
import {
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  RoleApiItem,
  GetAllRolesResponse,
  DeleteRoleRequest,
  DeleteRoleResponse,
} from '../../../interfaces/admin/creat-role';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class CreateRoleService {
  private readonly BASE_URL = `${environment.apiBaseUrl}/role`;

  constructor(private http: HttpClient) { }

  createRole(payload: CreateRoleRequest): Observable<CreateRoleResponse> {
    return this.http
      .post<CreateRoleResponse>(`${this.BASE_URL}/createRole`, payload, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  updateRole(payload: UpdateRoleRequest): Observable<UpdateRoleResponse> {
    return this.http
      .patch<UpdateRoleResponse>(`${this.BASE_URL}/updateRole`, payload, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  getAllRoles(): Observable<RoleApiItem[]> {
    return this.http
      .get<GetAllRolesResponse>(`${this.BASE_URL}/getAllRoles`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res?.data ?? []),
        catchError(this.handleError)
      );
  }

  deleteRole(payload: DeleteRoleRequest): Observable<DeleteRoleResponse> {
    return this.http
      .patch<DeleteRoleResponse>(`${this.BASE_URL}/deleteRole`, payload, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    const api = err.error as ApiErrorResponse | undefined;
    const msg = api?.message || api?.error || err.message || 'Failed to process role request';
    return throwError(() => new Error(msg));
  }
}

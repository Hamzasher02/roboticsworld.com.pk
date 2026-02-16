import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import {
  GetAllUsersResponse,
  AllUsersApiItem,
  UsersListItem,
  StaffApiItem,
  GetAllStaffResponse,
} from '../../../interfaces/admin/role';

export interface RegisterStaffResponse {
  sucess?: boolean; // backend typo: sucess
  success?: boolean;
  message: string;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class AllUsersService {
  private readonly URL = `${environment.apiBaseUrl}/user/getAllUsers`;

  constructor(private http: HttpClient) { }

  registerStaff(formData: FormData): Observable<RegisterStaffResponse> {
    const url = `${environment.apiBaseUrl}/staff/register`;
    return this.http
      .post<RegisterStaffResponse>(url, formData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  getUsersList(): Observable<UsersListItem[]> {
    return this.http
      .get<GetAllUsersResponse>(this.URL, { withCredentials: true })
      .pipe(
        map((res) => (res?.data ?? []).map((x) => this.toListItem(x))),
        catchError(this.handleError)
      );
  }

  getAllStaff(): Observable<StaffApiItem[]> {
    const url = `${environment.apiBaseUrl}/staff/getAllStaff`;
    return this.http
      .get<GetAllStaffResponse>(url, { withCredentials: true })
      .pipe(
        map((res) => this.extractStaffArray(res)),
        catchError(this.handleError)
      );
  }

  getStaffWithPendingStatus(role: string = ''): Observable<StaffApiItem[]> {
    const url = `${environment.apiBaseUrl}/staff/getStaffWithPendingStatus`;
    let params = new HttpParams();
    if (role && role !== 'All') {
      params = params.set('role', role);
    }

    return this.http
      .get<GetAllStaffResponse>(url, { params, withCredentials: true })
      .pipe(
        map((res) => this.extractStaffArray(res)),
        catchError(this.handleError)
      );
  }

  getStaffWithRoles(role: string = '', status: string = ''): Observable<StaffApiItem[]> {
    const url = `${environment.apiBaseUrl}/staff/getStaffWithRoles`;
    let params = new HttpParams();
    if (role && role !== 'All') {
      params = params.set('role', role);
    }
    if (status && status !== 'All') {
      params = params.set('status', status);
    }

    return this.http
      .get<GetAllStaffResponse>(url, { params, withCredentials: true })
      .pipe(
        map((res) => this.extractStaffArray(res)),
        catchError(this.handleError)
      );
  }

  getStaffWithNoRoles(): Observable<{ success: boolean; message: string; data: StaffApiItem[] }> {
    const url = `${environment.apiBaseUrl}/staff/getStaffWithNoRoles`;
    return this.http
      .get<GetAllStaffResponse>(url, { params: new HttpParams().set('limit', '100'), withCredentials: true })
      .pipe(
        map((res) => ({
          success: res.success,
          message: res.message,
          data: this.extractStaffArray(res)
        })),
        catchError(this.handleError)
      );
  }

  assignRole(payload: { email: string; roleName: string; roleId: string }): Observable<any> {
    const url = `${environment.apiBaseUrl}/staff/assignRole`;
    return this.http
      .post(url, payload, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  updateStaffRole(payload: { email: string; roleName: string; roleId: string }): Observable<any> {
    const url = `${environment.apiBaseUrl}/staff/updateStaffRole`;
    return this.http
      .patch(url, payload, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  removeStaffWithPendingStatus(email: string): Observable<{ success: boolean; message: string; data?: unknown }> {
    const url = `${environment.apiBaseUrl}/staff/removeStaffWithPendingStatus`;
    console.log('🔥 API Call:', 'PATCH', url, { email });
    return this.http
      .patch<{ success: boolean; message: string; data?: unknown }>(url, { email }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  toggleStaffStatus(staffId: string): Observable<{ success: boolean; message: string; data?: unknown }> {
    const url = `${environment.apiBaseUrl}/staff/toggleStaffStatus`;
    return this.http
      .patch<{ success: boolean; message: string; data?: unknown }>(url, { staffId }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  public extractStaffArray(res: GetAllStaffResponse): StaffApiItem[] {
    const raw = res?.data;
    if (Array.isArray(raw)) {
      if (raw.length > 0 && Array.isArray(raw[0])) {
        return raw[0] as StaffApiItem[];
      }
      return raw as unknown as StaffApiItem[];
    }
    return [];
  }

  private toListItem(x: AllUsersApiItem): UsersListItem {
    const first = (x.firstName ?? '').trim();
    const last = (x.lastName ?? '').trim();
    const name = `${first} ${last}`.trim();

    return {
      name: name || 'Unnamed',
      email: x.email ?? '',
      role: x.role ?? '',
      accountStatus: x.accountStatus ?? '',
    };
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}

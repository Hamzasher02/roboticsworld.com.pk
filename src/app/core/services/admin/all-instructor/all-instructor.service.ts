import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { GetAllInstructorsResponse, InstructorApiItem } from '../../../interfaces/admin/all-instructor';
import { buildFilterParams } from '../../../utils/api-utils';

@Injectable({ providedIn: 'root' })
export class AllInstructorService {
  private readonly URL = `${environment.apiBaseUrl}/user/getAllInstructors`;

  constructor(private http: HttpClient) { }

  getInstructors(search: string = '', statusTab: string = '', page: number = 1, limit: number = 10): Observable<{ instructors: InstructorApiItem[], pagination: any }> {
    const params = buildFilterParams(search, statusTab);
    const paginatedParams = params.set('page', page.toString()).set('limit', limit.toString());

    return this.http
      .get<GetAllInstructorsResponse>(this.URL, { params: paginatedParams, withCredentials: true })
      .pipe(
        map((res) => {
          return {
            instructors: res?.data ?? [],
            pagination: res?.pagination
          };
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) return of({ instructors: [], pagination: null });
          return throwError(() => error);
        })
      );
  }

  updateInstructorStatus(instructorId: string, accountStatus: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/user/changeInstructorStatus`;
    return this.http.patch(url, { instructorId, accountStatus }, { withCredentials: true });
  }

  getInstructorVerificationStats(): Observable<any> {
    const url = `${environment.apiBaseUrl}/instructor/getVerifiedAndUnverifiedInstructors`;
    return this.http.get<any>(url, { withCredentials: true });
  }
}
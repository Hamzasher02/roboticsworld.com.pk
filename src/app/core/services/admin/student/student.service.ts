import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import {
  GetAllStudentsResponse,
  StudentApiItem,
  StudentListItem,
} from '../../../interfaces/admin/all-student';

import { buildFilterParams } from '../../../utils/api-utils';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly URL = `${environment.apiBaseUrl}/user/getAllStudents`;

  constructor(private http: HttpClient) { }

  getStudentsList(search: string = '', statusTab: string = '', page: number = 1, limit: number = 10): Observable<{ students: StudentListItem[], pagination: any }> {
    const params = buildFilterParams(search, statusTab);
    const paginatedParams = params.set('page', page.toString()).set('limit', limit.toString());

    return this.http
      .get<GetAllStudentsResponse>(this.URL, { params: paginatedParams, withCredentials: true })
      .pipe(
        map((res) => {
          // Direct mapping as per backend structure data[0]
          const studentsSource = (res.data?.[0] as StudentApiItem[]) ?? [];

          return {
            students: studentsSource.map((x) => this.toListItem(x)),
            pagination: res.pagination
          };
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) return of({ students: [], pagination: null });
          return throwError(() => error);
        })
      );
  }


  updateStudentStatus(studentId: string, accountStatus: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/user/changeStudentStatus`;
    return this.http.patch(url, { studentId, accountStatus }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  private toListItem(x: StudentApiItem): StudentListItem {
    const first = (x.firstName ?? '').trim();
    const last = (x.lastName ?? '').trim();
    const name = `${first} ${last}`.trim();

    // Backend returns courses as array of titles directly, join them for display
    const courseTitles = (x.courses ?? []).filter(c => !!c).join(', ');

    // Mocking for Figma UI (not present in current backend API response)
    const createdAt = x.createdAt ? new Date(x.createdAt) : new Date();
    const enrollmentDate = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const expiryDate = new Date(createdAt.setFullYear(createdAt.getFullYear() + 1))
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const subscriptionArr = ['Basic', 'Intermediate', 'Premium'];
    const mockSubscription = subscriptionArr[Math.floor(Math.random() * subscriptionArr.length)];

    return {
      profilePictureUrl: x.profilePicture?.secureUrl ?? null,
      name: name || 'Unnamed',
      email: x.email ?? '',
      courses: courseTitles || 'No courses',
      accountStatus: x.accountStatus ?? '', // NO FALLBACK: directly reflect backend
      id: x._id,
      subscription: mockSubscription,
      enrollmentDate,
      expiryDate
    };
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}

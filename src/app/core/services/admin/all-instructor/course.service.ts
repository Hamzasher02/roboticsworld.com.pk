import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { GetAllCoursesResponse, CourseMin } from '../../../interfaces/admin/all-instructor';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly URL = `${environment.apiBaseUrl}/public/courses`; // ✅ apna real endpoint yahan set karo

  constructor(private http: HttpClient) {}

  /** returns minimal courses list */
  getCourses(): Observable<CourseMin[]> {
    return this.http.get<GetAllCoursesResponse>(this.URL, { withCredentials: true }).pipe(
      map((res) => res?.data ?? []),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PublicCourseMin, PublicCoursesMinResponse } from '../../../interfaces/teacher/public-courses/public-courses';

@Injectable({ providedIn: 'root' })
export class PublicCoursesService {
  private readonly BASE_URL = environment.apiBaseUrl.replace(/\/$/, '');
  private readonly PUBLIC_COURSES_URL = `${this.BASE_URL}/public/courses`;

  constructor(private http: HttpClient) {}

  getPublicCoursesRaw(): Observable<PublicCoursesMinResponse> {
    return this.http.get<PublicCoursesMinResponse>(this.PUBLIC_COURSES_URL).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  /** ✅ dropdown ke liye sirf _id + courseTitle */
  getPublicCoursesMin(): Observable<PublicCourseMin[]> {
    return this.getPublicCoursesRaw().pipe(
      map((res) => res?.data ?? []),
      map((arr) => arr.map((c) => ({ _id: c._id, courseTitle: c.courseTitle })))
    );
  }
}

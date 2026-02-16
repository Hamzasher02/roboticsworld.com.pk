import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';

import {
  GetMyAssignedCoursesResponse,
  GetCourseByIdResponse,
  GetCourseModulesResponse,
  GetCourseStudentsResponse
} from '../../../interfaces/teacher/courses/courses';

@Injectable({ providedIn: 'root' })
export class InstructorCoursesService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ✅ pagination-ready
  getMyAssignedCourses(page = 1, limit = 10): Observable<GetMyAssignedCoursesResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    return this.http.get<GetMyAssignedCoursesResponse>(
      `${this.baseUrl}/instructor/getMyAssignedCourses`,
      { withCredentials: true, params }
    );
  }

  getCourseById(courseId: string): Observable<GetCourseByIdResponse> {
    return this.http.get<GetCourseByIdResponse>(
      `${this.baseUrl}/instructor/getCourseById/${courseId}`,
      { withCredentials: true }
    );
  }

  getCourseModulesUserSide(courseId: string): Observable<GetCourseModulesResponse> {
    return this.http.get<GetCourseModulesResponse>(
      `${this.baseUrl}/coursemodules/getAllCourseModuleUserSide/${courseId}`,
      { withCredentials: true }
    );
  }

  getCourseStudentsProgress(courseId: string): Observable<GetCourseStudentsResponse> {
    return this.http.get<GetCourseStudentsResponse>(
      `${this.baseUrl}/coursesession/instructor/${courseId}/students`,
      { withCredentials: true }
    );
  }
}

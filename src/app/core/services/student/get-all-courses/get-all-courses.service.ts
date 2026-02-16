import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Course, GetAllCoursesResponse } from '../../../interfaces/student/get-all-courses/get-all-courses';
import { CourseDetailResponse } from '../../../interfaces/student/course-detail/course-detail';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private readonly BASE_URL = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getAllCoursesStudentSide(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    ageGroup?: string;
    level?: string;
    courseEnrollementType?: string;
  }): Observable<GetAllCoursesResponse> {
    return this.http.get<GetAllCoursesResponse>(
      `${this.BASE_URL}/course/getAllCoursesUserSide`,
      { params: params as any }
    );
  }


  getSingleCourseStudentSide(courseId: string): Observable<CourseDetailResponse> {
    return this.http.get<any>(
      `${this.BASE_URL}/public/courses/${courseId}`
    ).pipe(
      map(response => {
        // The API returns { success, message, data: { course, curriculum, learningOutcomes, feedbacks } }
        if (response.success && response.data) {
          return response;
        }

        // Fallback for unexpected structures
        return {
          success: response.success || false,
          message: response.message || 'Course not found',
          data: response.data || {
            course: null as any,
            curriculum: [],
            learningOutcomes: [],
            feedbacks: []
          }
        };
      })
    );
  }
}

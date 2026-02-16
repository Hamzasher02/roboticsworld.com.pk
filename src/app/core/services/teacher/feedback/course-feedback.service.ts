import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';

import { GetCourseFeedbacksResponse } from '../../../interfaces/teacher/feedback/feedback';

@Injectable({ providedIn: 'root' })
export class CourseFeedbackService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // courseId wise
  getCourseFeedbacks(courseId: string): Observable<GetCourseFeedbacksResponse> {
    return this.http.get<GetCourseFeedbacksResponse>(
      `${this.baseUrl}/coursefeedback/getCourseFeedbacks/${courseId}`,
      { withCredentials: true }
    );
  }

  // instructor wise (all courses)
  getInstructorWiseAllCourseFeedback(): Observable<GetCourseFeedbacksResponse> {
    return this.http.get<GetCourseFeedbacksResponse>(
      `${this.baseUrl}/coursefeedback/getInstructorWiseAllCourseFeedback`,
      { withCredentials: true }
    );
  }
}

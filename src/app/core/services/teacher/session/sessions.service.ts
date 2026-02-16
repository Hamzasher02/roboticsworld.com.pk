import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

import {
  GetInstructorMySessionsResponse,
  GetInstructorSessionModulesDetailResponse,
  MarkModuleCompleteResponse,
} from '../../../interfaces/teacher/sessions/manage-sessions';

@Injectable({ providedIn: 'root' })
export class InstructorSessionsService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getMySessions(page = 1, limit = 10): Observable<GetInstructorMySessionsResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    return this.http.get<GetInstructorMySessionsResponse>(
      `${this.baseUrl}/coursesession/instructor/my-sessions`,
      { params, withCredentials: true }
    );
  }

  getSessionModulesDetail(sessionId: string): Observable<GetInstructorSessionModulesDetailResponse> {
    return this.http.get<GetInstructorSessionModulesDetailResponse>(
      `${this.baseUrl}/coursesession/instructor/${sessionId}/modules-detail`,
      { withCredentials: true }
    );
  }

  // ✅ NEW: mark module complete
  markModuleComplete(sessionId: string, moduleId: string): Observable<MarkModuleCompleteResponse> {
    // If backend expects PUT/POST, change this.http.patch -> this.http.put / this.http.post
    return this.http.patch<MarkModuleCompleteResponse>(
      `${this.baseUrl}/coursesession/instructor/${sessionId}/modules/${moduleId}/mark-complete`,
      {},
      { withCredentials: true }
    );
  }
  // ✅ NEW: get demo sessions for instructor
getInstructorDemoSessions(): Observable<any> {
  return this.http.get<any>(
    `${this.baseUrl}/demosession/getInstructorDemoSessions`,
    { withCredentials: true }
  );
}

}

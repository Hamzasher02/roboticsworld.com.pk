import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import {
  GetInstructorProfileResponse,
  ApiResponse,
  AcademicInfo
} from '../../../interfaces/teacher/profile/instructor-profile';

@Injectable({ providedIn: 'root' })
export class InstructorProfileService {
  private readonly PROFILE_URL = `${environment.apiBaseUrl}/instructor/getInstructorProfile`;

  private readonly UPDATE_INFO_URL = `${environment.apiBaseUrl}/instructor/updateInstructorInformation`;
  private readonly UPDATE_ACADEMIC_URL = `${environment.apiBaseUrl}/instructor/updateInstructorAcademicDetails`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<GetInstructorProfileResponse> {
    return this.http
      .get<GetInstructorProfileResponse>(this.PROFILE_URL, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // ✅ update instructor personal + residence + emergency (multipart/form-data)
  updateInstructorInformation(fd: FormData): Observable<ApiResponse<any>> {
    return this.http
      .patch<ApiResponse<any>>(this.UPDATE_INFO_URL, fd, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // ✅ update academic (multipart/form-data)
  updateInstructorAcademicDetails(fd: FormData): Observable<ApiResponse<AcademicInfo>> {
    return this.http
      .patch<ApiResponse<AcademicInfo>>(this.UPDATE_ACADEMIC_URL, fd, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}

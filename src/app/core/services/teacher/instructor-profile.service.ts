import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { GetInstructorProfileResponse } from '../../interfaces/teacher/instructor-profile';

@Injectable({ providedIn: 'root' })
export class InstructorProfileService {
  private readonly PROFILE_URL = `${environment.apiBaseUrl}/instructor/getInstructorProfile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<GetInstructorProfileResponse> {
    return this.http
      .get<GetInstructorProfileResponse>(this.PROFILE_URL, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}

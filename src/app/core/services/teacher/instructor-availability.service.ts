// instructor availability service
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { GetMyAvailabilityResponse } from '../../interfaces/teacher/instructor-availability';

@Injectable({ providedIn: 'root' })
export class InstructorAvailabilityService {
  private readonly MY_SLOTS_URL = `${environment.apiBaseUrl}/instructor/availability/mySlots`;

  constructor(private http: HttpClient) { }

  getMySlots(): Observable<GetMyAvailabilityResponse> {
    return this.http
      .get<GetMyAvailabilityResponse>(this.MY_SLOTS_URL, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}

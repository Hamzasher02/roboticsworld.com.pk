// ✅ src/app/core/services/teacher/instructor-availability.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { GetMyAvailabilityResponse } from '../../../interfaces/teacher/availability/instructor-availability';

export interface CreateSlotRequest {
  sessionTitle: string;
  scheduleType: 'Recurring Weekly' | 'Specific Date' | 'Date Range';
  days: Array<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'>;
  startTime: string;
  endTime: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class InstructorAvailabilityService {
  private readonly MY_SLOTS_URL = `${environment.apiBaseUrl}/instructor/availability/mySlots`;
  private readonly CREATE_SLOT_URL = `${environment.apiBaseUrl}/instructor/availability/createSlot`;
  private readonly DELETE_SLOT_URL = `${environment.apiBaseUrl}/instructor/availability/deleteSlot`;
  private readonly UPDATE_SLOT_URL = `${environment.apiBaseUrl}/instructor/availability/updateSlot`; // ✅ base

  constructor(private http: HttpClient) {}

  getMySlots(): Observable<GetMyAvailabilityResponse> {
    return this.http
      .get<GetMyAvailabilityResponse>(this.MY_SLOTS_URL, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  createSlot(payload: CreateSlotRequest): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.CREATE_SLOT_URL, payload, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  deleteSlot(slotId: string): Observable<ApiResponse<null>> {
    return this.http
      .delete<ApiResponse<null>>(`${this.DELETE_SLOT_URL}/${slotId}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // ✅ UPDATE slot (PUT/PATCH — aapka backend jo use kar raha ho)
 updateSlot(slotId: string, payload: CreateSlotRequest): Observable<ApiResponse<any>> {
  return this.http
    .patch<ApiResponse<any>>(
      `${this.UPDATE_SLOT_URL}/${slotId}`,
      payload,
      { withCredentials: true }
    )
    .pipe(catchError(this.handleError));
}


  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}

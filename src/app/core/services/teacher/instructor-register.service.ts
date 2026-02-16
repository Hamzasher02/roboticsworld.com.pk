import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  InstructorRegisterPayload,
  InstructorRegisterResponse,
} from '../../interfaces/teacher/instructor-register';

@Injectable({ providedIn: 'root' })
export class InstructorRegisterService {
  private readonly BASE_URL = environment.apiBaseUrl.replace(/\/$/, '');
  private readonly REGISTER_INSTRUCTOR_URL = `${this.BASE_URL}/auth/register/instructor`;

  constructor(private http: HttpClient) {}

  registerInstructor(
    payload: InstructorRegisterPayload,
    files: File[]
  ): Observable<InstructorRegisterResponse> {
    const fd = this.toFormData(payload, files);

    return this.http.post<InstructorRegisterResponse>(this.REGISTER_INSTRUCTOR_URL, fd).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  private toFormData(payload: InstructorRegisterPayload, files: File[]): FormData {
    const fd = new FormData();

    // Personal
    fd.append('firstName', payload.firstName);
    fd.append('lastName', payload.lastName);
    fd.append('fatherName', payload.fatherName);
    fd.append('email', payload.email);
    fd.append('password', payload.password);
    fd.append('phoneNumber', payload.phoneNumber);
    fd.append('dateOfBirth', payload.dateOfBirth);
    fd.append('bio', payload.bio);
    fd.append('role', payload.role);

    // Meta
    fd.append('consentAccepted', String(payload.consentAccepted)); // "true"/"false"

    // Residence
    fd.append('country', payload.country);
    fd.append('address', payload.address);
    fd.append('city', payload.city);
    fd.append('postalCode', payload.postalCode);

    // Emergency
    fd.append('fullName', payload.fullName);
    fd.append('relationship', payload.relationship);
    fd.append('emergencyPhoneNumber', payload.emergencyPhoneNumber);

    // Academic
    fd.append('qualification', payload.qualification);
    fd.append('degreeTitle', payload.degreeTitle);
    fd.append('graduationYear', payload.graduationYear);
    fd.append('totalMarks', payload.totalMarks);
    fd.append('obtainedMarks', payload.obtainedMarks);
    fd.append('institution', payload.institution);

    // ✅ coursePreferences (repeat same key like Postman)
    (payload.coursePreferences || []).forEach((id) => fd.append('coursePreferences', id));

    // ✅ files (repeat same key "files" — 2 files: image + pdf)
    (files || []).forEach((f) => fd.append('files', f));

    return fd;
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../http/api-client.service';
import { StudentProfileResponse, StudentUpdatePayload } from '../../../interfaces/student/profile/student-profile.interface';

@Injectable({ providedIn: 'root' })
export class StudentProfileService {
    private readonly USER_BASE = '/user';

    constructor(private api: ApiClientService) { }

    /**
     * Get current student information.
     * GET /user/getStudentInformation
     */
    getStudentProfile(): Observable<StudentProfileResponse> {
        return this.api.get<StudentProfileResponse>(`${this.USER_BASE}/getStudentInformation`);
    }

    /**
     * Update student information.
     * PATCH /user/updateStudentInformation
     */
    updateStudentInformation(data: StudentUpdatePayload | FormData): Observable<any> {
        return this.api.patch<any>(`${this.USER_BASE}/updateStudentInformation`, data);
    }
}

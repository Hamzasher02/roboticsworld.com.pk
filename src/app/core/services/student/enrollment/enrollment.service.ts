// enrollment service
import { Injectable } from '@angular/core';
import { Observable, throwError, map, catchError, of } from 'rxjs';
import { ApiClientService } from '../../../http/api-client.service';
import {
    Enrollment,
    EnrollmentStatusCheck,
    EnrolledCourseData,
    ModuleDetail,
    LectureDetail,
    PdfDetail,
} from '../../../interfaces/student/enrollments/enrollment.interface';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
    private readonly BASE_PATH = '/enrollment';

    constructor(private api: ApiClientService) { }

    checkEnrollmentStatus(courseId: string): Observable<EnrollmentStatusCheck> {
        return this.api.get<any>(
            `${this.BASE_PATH}/checkEnrollmentStatus/${courseId.trim()}`
        ).pipe(
            map(res => {
                const data = res?.data || res;
                const enrollment = data?.enrollment || null;
                let isEnrolled = data?.isEnrolled ?? false;

                if (!isEnrolled && enrollment?.enrollmentStatus === 'approved') {
                    isEnrolled = true;
                }

                return { isEnrolled, enrollment };
            }),
            catchError(err => {
                return throwError(() => err);
            })
        );
    }

    createEnrollment(
        courseId: string,
        paymentScreenshot: File,
        additionalData: {
            enrollmentType: 'Live Classes' | 'Recorded Lectures';
            preferredClassTime?: string;
            invoiceNumber?: string;
        }
    ): Observable<Enrollment> {
        const formData = new FormData();
        formData.append('paymentScreenshot', paymentScreenshot);
        formData.append('enrollmentType', additionalData.enrollmentType);

        if (additionalData.enrollmentType === 'Live Classes' && additionalData.preferredClassTime) {
            formData.append('preferredClassTime', additionalData.preferredClassTime);
        }
        if (additionalData.invoiceNumber) {
            formData.append('invoiceNumber', additionalData.invoiceNumber);
        }

        return this.api.postFormData<Enrollment>(
            `${this.BASE_PATH}/createEnrollment/${courseId}`,
            formData
        );
    }

    getUserEnrollments(): Observable<Enrollment[]> {
        return this.api.get<any>(`${this.BASE_PATH}/getUserEnrollments`).pipe(
            map(res => {
                return this.extractEnrollments(res);
            }),
            catchError(err => {
                if (err && err.raw) {
                    const extracted = this.extractEnrollments(err.raw);
                    if (extracted.length > 0) {
                        return of(extracted);
                    }
                }

                return of([]);
            })
        );
    }

    private extractEnrollments(data: any): Enrollment[] {
        if (!data) return [];

        if (Array.isArray(data)) return data;

        if (data.enrollments && Array.isArray(data.enrollments)) return data.enrollments;
        if (data.data && Array.isArray(data.data)) return data.data;
        if (data.data && data.data.enrollments && Array.isArray(data.data.enrollments)) return data.data.enrollments;

        if (typeof data === 'object') {
            const arrays = Object.values(data).filter(val => Array.isArray(val)) as any[][];
            if (arrays.length > 0) return arrays[0];
        }

        if (data.enrollmentStatus || data.course) return [data as Enrollment];
        if (data.data && (data.data.enrollmentStatus || data.data.course)) return [data.data as Enrollment];
        if (data.course && data.user) return [data as Enrollment];

        return [];
    }

    getEnrollmentById(enrollmentId: string): Observable<Enrollment> {
        return this.api.get<Enrollment>(
            `${this.BASE_PATH}/getSingleEnrollment/${enrollmentId}`
        );
    }

    getEnrolledCourseData(courseId: string): Observable<EnrolledCourseData> {
        return this.api.get<EnrolledCourseData>(
            `${this.BASE_PATH}/getEnrolledCourseData/${courseId}`
        );
    }

    getModuleDetail(enrollmentId: string, moduleId: string): Observable<ModuleDetail> {
        return this.api.get<ModuleDetail>(
            `${this.BASE_PATH}/${enrollmentId}/modules/${moduleId}`
        );
    }

    getLectureDetail(
        enrollmentId: string,
        moduleId: string,
        lectureId: string
    ): Observable<LectureDetail> {
        return this.api.get<LectureDetail>(
            `${this.BASE_PATH}/${enrollmentId}/modules/${moduleId}/lectures/${lectureId}`
        );
    }

    getPdfDetail(
        enrollmentId: string,
        moduleId: string,
        pdfId: string
    ): Observable<PdfDetail> {
        return this.api.get<PdfDetail>(
            `${this.BASE_PATH}/${enrollmentId}/modules/${moduleId}/pdfs/${pdfId}`
        );
    }

    async isEnrolled(courseId: string): Promise<boolean> {
        try {
            const status = await this.checkEnrollmentStatus(courseId).toPromise();
            return status?.isEnrolled ?? false;
        } catch {
            return false;
        }
    }
}


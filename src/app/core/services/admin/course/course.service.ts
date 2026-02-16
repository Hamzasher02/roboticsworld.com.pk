import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CourseCatalogResponse, CreateCourseResponse, CreateCoursePayload } from '../../../interfaces/admin/course';

@Injectable({
    providedIn: 'root'
})
export class CourseService {
    private readonly baseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    createCourse(payload: CreateCoursePayload): Observable<CreateCourseResponse> {
        const url = `${this.baseUrl}/course/createCourse`;
        const formData = new FormData();
        formData.append('courseTitle', payload.courseTitle);
        formData.append('courseCategory', payload.courseCategory);
        formData.append('courseSubCategory', payload.courseSubCategory);
        formData.append('courseLevel', payload.courseLevel);
        formData.append('courseAgeGroup', payload.courseAgeGroup);
        formData.append('courseAccess', payload.courseAccess);
        formData.append('coursePrice', payload.coursePrice);
        formData.append('courseEnrollementType', payload.courseEnrollementType);
        formData.append('files', payload.thumbnailFile);
        formData.append('files', payload.outlinePdf);

        return this.http.post<CreateCourseResponse>(url, formData, { withCredentials: true });
    }

    getCourseCatalogAdminSide(type: 'course' | 'bundle'): Observable<CourseCatalogResponse> {
        const url = `${this.baseUrl}/course/getCourseCatalogAdminSide`;
        const params = new HttpParams().set('type', type);
        return this.http.get<CourseCatalogResponse>(url, { params, withCredentials: true });
    }
}

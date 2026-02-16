import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AdminCourseCatalogResponse, AdminCatalogParams } from '../../../interfaces/admin/admin-course.interfaces';
import { GetAllCoursesResponse } from '../../../interfaces/admin/course/all-courses';

@Injectable({
    providedIn: 'root'
})
export class AdminCourseService {
    private readonly baseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    getAdminCatalog(params: AdminCatalogParams): Observable<AdminCourseCatalogResponse> {
        const url = `${this.baseUrl}/course/getCourseCatalogAdminSide`;
        let httpParams = new HttpParams();

        // Iterate through params and append to HttpParams if valid
        Object.keys(params).forEach(key => {
            const val = (params as any)[key];
            if (val !== undefined && val !== null && val !== '') {
                httpParams = httpParams.append(key, val.toString());
            }
        });

        return this.http.get<AdminCourseCatalogResponse>(url, {
            params: httpParams,
            withCredentials: true
        });
    }

    toggleCourseVisibility(courseId: string): Observable<any> {
        const url = `${this.baseUrl}/course/toggleVisiblity/${courseId}`;
        return this.http.get<any>(url, { withCredentials: true });
    }

    getAllCoursesForBundle(filters: {
        category?: string,
        subCategory?: string[],
        ageGroup?: string[],
        level?: string[]
    }): Observable<GetAllCoursesResponse> {
        const url = `${this.baseUrl}/course/getAllCoursesAdminSideWhileCreatingBundle`;
        let params = new HttpParams();

        if (filters.category) params = params.set('category', filters.category);

        if (filters.subCategory?.length) {
            filters.subCategory.forEach(s => params = params.append('subCategory', s));
        }
        if (filters.ageGroup?.length) {
            filters.ageGroup.forEach(a => params = params.append('ageGroup', a));
        }
        if (filters.level?.length) {
            filters.level.forEach(l => params = params.append('level', l));
        }

        return this.http.get<GetAllCoursesResponse>(url, {
            params,
            withCredentials: true
        });
    }

    getCourseById(courseId: string): Observable<any> {
        const url = `${this.baseUrl}/course/getSingleCourseAdminSide/${courseId}`;
        return this.http.get<any>(url, { withCredentials: true });
    }

    // Get instructors currently assigned to this course
    getAssignedInstructors(courseId: string): Observable<any> {
        const url = `${this.baseUrl}/instructor/getInstrcutorsAssignedToACourse/${courseId}`;
        return this.http.get<any>(url, { withCredentials: true });
    }

    // Get instructors available to be assigned to this course
    getAvailableInstructors(courseId: string): Observable<any> {
        const url = `${this.baseUrl}/instructor/getInstructorsThatCanBeAssignedToACourse/${courseId}`;
        return this.http.get<any>(url, { withCredentials: true });
    }

    assignInstructor(courseId: string, instructorId: string): Observable<any> {
        const url = `${this.baseUrl}/course/assignInstructorToACourse/${courseId}`;
        return this.http.patch<any>(url, { instructorId }, { withCredentials: true });
    }

    removeInstructor(courseId: string, instructorId: string): Observable<any> {
        const url = `${this.baseUrl}/course/removeInstructorFromACourse/${courseId}`;
        return this.http.patch<any>(url, { instructorId }, { withCredentials: true });
    }

    /* ---------------- Learning Outcomes ---------------- */

    getCourseLearningOutcomes(courseId: string): Observable<any> {
        const url = `${this.baseUrl}/outcome/getAllCourseLearningOutcome/${courseId}`;
        return this.http.get<any>(url, { withCredentials: true });
    }

    createLearningOutcome(courseId: string, description: string): Observable<any> {
        const url = `${this.baseUrl}/outcome/createCourseLearningOutcome`;
        return this.http.post<any>(url, { courseId, outcomeDescription: description }, { withCredentials: true });
    }

    deleteLearningOutcome(courseId: string, outcomeId: string): Observable<any> {
        // Soft delete endpoint expects body: { courseId, courseOutcomeId }
        const url = `${this.baseUrl}/outcome/deleteCourseLearningOutcome`;
        return this.http.patch<any>(url, { courseId, courseOutcomeId: outcomeId }, { withCredentials: true });
    }

    updateLearningOutcome(courseId: string, outcomeId: string, description: string): Observable<any> {
        const url = `${this.baseUrl}/outcome/updateCourseLearningOutcome`;
        return this.http.patch<any>(url, { courseId, courseOutcomeId: outcomeId, outcomeDescription: description }, { withCredentials: true });
    }

    /* ---------------- Basic Info & Overview ---------------- */

    createCourse(formData: FormData): Observable<any> {
        const url = `${this.baseUrl}/course/createCourse`;
        return this.http.post<any>(url, formData, { withCredentials: true });
    }

    updateCourseBasicInfo(courseId: string, formData: FormData): Observable<any> {
        const url = `${this.baseUrl}/course/updateCourseBasicInformation/${courseId}`;
        return this.http.patch<any>(url, formData, { withCredentials: true });
    }

    /* ---------------- Course Modules ---------------- */

    getCourseModules(courseId: string): Observable<any> {
        const url = `${this.baseUrl}/coursemodules/getCourseModules/${courseId}`;
        return this.http.get<any>(url, { withCredentials: true });
    }

    createCourseModule(payload: {
        courseId: string;
        moduleName: string;
        moduleDescription: string;
        noOfSession: number;
        sessionDuration: number;
    }): Observable<any> {
        const url = `${this.baseUrl}/coursemodules/createCourseModule`;
        return this.http.post<any>(url, payload, { withCredentials: true });
    }

    updateCourseModule(courseId: string, courseModuleId: string, payload: {
        courseId: string;
        courseModuleId: string;
        moduleName: string;
        moduleDescription: string;
        noOfSession: number;
        sessionDuration: number;
    }): Observable<any> {
        const url = `${this.baseUrl}/coursemodules/updateCourseModule/${courseId}/${courseModuleId}`;
        return this.http.patch<any>(url, payload, { withCredentials: true });
    }

    deleteCourseModule(courseId: string, courseModuleId: string): Observable<any> {
        const url = `${this.baseUrl}/coursemodules/deleteCourseModule`;
        return this.http.patch<any>(url, { courseId, courseModuleId }, { withCredentials: true });
    }

    /* ---------------- Course Material Uploads ---------------- */

    uploadCourseLecture(formData: FormData): Observable<any> {
        const url = `${this.baseUrl}/courselectures/uploadCourseLecture`;
        return this.http.post<any>(url, formData, {
            withCredentials: true,
            reportProgress: true,
            observe: 'events'
        });
    }

    uploadCoursePdf(formData: FormData): Observable<any> {
        const url = `${this.baseUrl}/coursepdfmaterial/uploadCoursePdf`;
        return this.http.post<any>(url, formData, {
            withCredentials: true,
            reportProgress: true,
            observe: 'events'
        });
    }

    getLecturesByModule(courseId: string): Observable<any> {
        const url = `${this.baseUrl}/courselectures/getAllLecturesByModule/${courseId}`;
        return this.http.get<any>(url, { withCredentials: true });
    }

    getPdfsByModule(courseId: string): Observable<any> {
        const url = `${this.baseUrl}/coursepdfmaterial/getAllPdfsByModule/${courseId}`;
        return this.http.get<any>(url, { withCredentials: true });
    }

    publishCourse(courseId: string): Observable<any> {
        const url = `${this.baseUrl}/course/publishCourse/${courseId}`;
        return this.http.get<any>(url, { withCredentials: true });
    }

    updateLectureTitle(courseId: string, lectureId: string, title: string): Observable<any> {
        const url = `${this.baseUrl}/courselectures/updateLectureTitle/${courseId}/${lectureId}`;
        return this.http.patch<any>(url, { title }, { withCredentials: true });
    }

    updatePdfTitle(courseId: string, pdfId: string, title: string): Observable<any> {
        const url = `${this.baseUrl}/coursepdfmaterial/updatePdfTitle/${courseId}/${pdfId}`;
        return this.http.patch<any>(url, { title }, { withCredentials: true });
    }

    deleteCourseLecture(courseId: string, lectureId: string): Observable<any> {
        const url = `${this.baseUrl}/courselectures/deleteLecture/${courseId}/${lectureId}`;
        return this.http.patch<any>(url, {}, { withCredentials: true });
    }

    deleteCoursePdf(courseId: string, pdfId: string): Observable<any> {
        const url = `${this.baseUrl}/coursepdfmaterial/deletePdf/${courseId}/${pdfId}`;
        return this.http.delete<any>(url, { withCredentials: true });
    }
}

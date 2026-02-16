import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetAllDeletionHistoryResponse } from '../../../interfaces/admin/deletion-history';

@Injectable({
    providedIn: 'root'
})
export class DeletionHistoryService {
    private readonly baseUrl = `${environment.apiBaseUrl}/deletionhistory`;

    constructor(private http: HttpClient) { }

    getAllDeletionHistory(
        page: number = 1,
        limit: number = 10,
        type?: string,
        startDate?: string,
        endDate?: string
    ): Observable<GetAllDeletionHistoryResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (type && type !== 'All') params = params.set('type', type);
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        return this.http.get<GetAllDeletionHistoryResponse>(`${this.baseUrl}/getAllDeletionHistory`, {
            params,
            withCredentials: true
        });
    }

    restoreItem(item: any): Observable<any> {
        const type = item.itemModel;
        const id = item.itemId;

        // Base API URL pattern from environment
        const api = environment.apiBaseUrl;

        switch (type) {
            case 'Category':
                return this.http.patch(`${api}/category/restoreCategory/${id}`, {}, { withCredentials: true });

            case 'CourseBundle':
                return this.http.patch(`${api}/coursebundle/restoreBundle/${id}`, {}, { withCredentials: true });

            case 'CourseLecture':
                // Body usually requires specific IDs. Assuming lectureId is enough or courseId needed.
                // User instruction: "send required ids in body".
                // Controller check: restoreLecture usually needs lectureId.
                const lecCourseId = this.getAffectedId(item, 'Course');
                return this.http.patch(`${api}/courselectures/restoreLecture`, { lectureId: id, courseId: lecCourseId }, { withCredentials: true });

            case 'CourseModule':
                return this.http.patch(`${api}/coursemodules/restoreCourseModule`, { courseModuleId: id }, { withCredentials: true });

            case 'CourseLearningOutcome':
                // User instruction: PATCH /outcome/restoreCourseLearningOutcome/:id
                return this.http.patch(`${api}/outcome/restoreCourseLearningOutcome/${id}`, {}, { withCredentials: true });

            case 'PdfMaterial':
                const pdfCourseId = this.getAffectedId(item, 'Course');
                return this.http.patch(`${api}/coursepdfmaterial/restorePdfMaterial/${pdfCourseId}/${id}`, {}, { withCredentials: true });

            case 'Staff':
                // Controller requires 'email'. We often only have ID. 
                // We'll send email if present in item (unlikely) or try sending ID as fallback/check if backed adjusted.
                return this.http.patch(`${api}/staff/restoreStaffWithPendingStatus`, { email: item.itemName, staffId: id }, { withCredentials: true });

            case 'Role':
                return this.http.patch(`${api}/role/restoreRole`, { roleId: id }, { withCredentials: true });

            default:
                throw new Error(`Restore not implemented for type: ${type}`);
        }
    }

    deletePermanently(item: any): Observable<any> {
        const type = item.itemModel;
        const id = item.itemId;
        const api = environment.apiBaseUrl;

        switch (type) {
            case 'Category':
                return this.http.delete(`${api}/category/deleteCategoryPermanently/${id}`, { withCredentials: true });

            case 'CourseLecture':
                return this.http.delete(`${api}/courselectures/deleteLecturePermanently/${id}`, { withCredentials: true });

            case 'CourseModule':
                return this.http.delete(`${api}/coursemodules/deleteCourseModulePermanently/${id}`, { withCredentials: true });

            case 'CourseLearningOutcome':
                return this.http.delete(`${api}/outcome/deleteCourseLearningOutcomePermanently/${id}`, { withCredentials: true });

            case 'PdfMaterial':
                return this.http.delete(`${api}/coursepdfmaterial/deletePdfMaterialPermanently/${id}`, { withCredentials: true });

            case 'Staff':
                return this.http.delete(`${api}/staff/deleteStaffPermanently/${id}`, { withCredentials: true });

            case 'Role':
                // Permanent delete not yet implemented in backend as per provided file view
                throw new Error("Permanent delete not supported for Role");

            default:
                // Default fallback or error
                return this.http.delete(`${api}/${type.toLowerCase()}/deletePermanently/${id}`, { withCredentials: true });
        }
    }

    private getAffectedId(item: any, modelName: string): string | undefined {
        if (!item.affectedRefs || !Array.isArray(item.affectedRefs)) return undefined;
        // Search in affectedRefs
        const ref = item.affectedRefs.find((r: any) => r.model === modelName);
        return ref ? ref.refId : undefined;
    }
}

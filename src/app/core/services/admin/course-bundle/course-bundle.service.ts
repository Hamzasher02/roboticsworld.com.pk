import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CreateBundlePayload, CreateBundleResponse } from '../../../interfaces/admin/course-bundle';

@Injectable({
    providedIn: 'root'
})
export class CourseBundleService {
    private apiUrl = `${environment.apiBaseUrl}/coursebundle`;

    constructor(private http: HttpClient) { }

    createBundle(formData: FormData): Observable<CreateBundleResponse> {
        return this.http.post<CreateBundleResponse>(`${this.apiUrl}/createBundle`, formData, {
            withCredentials: true
        });
    }

    getAllBundles(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/getAllBundles`, {
            withCredentials: true
        });
    }
    updateBundle(id: string, formData: FormData): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/updateBundle/${id}`, formData, {
            withCredentials: true
        });
    }

    getSingleBundle(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/getSingleBundle/${id}`, {
            withCredentials: true
        });
    }
}

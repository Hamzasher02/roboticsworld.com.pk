import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NameChangeService {
    private apiUrl = `${environment.apiBaseUrl}/namechange`;

    constructor(private http: HttpClient) { }

    getAllNameChangeRequests(page: number = 1, limit: number = 10): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get<any>(`${this.apiUrl}/getAllNameChangeRequests`, {
            params,
            withCredentials: true
        });
    }

    getSingleNameChangeRequest(requestId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/getSingleNameChangeRequest/${requestId}`, {
            withCredentials: true
        });
    }

    processNameChangeRequest(requestId: string, isApproved: boolean): Observable<any> {
        const url = `${this.apiUrl}/approveOrRejectNameChangeRequest/${requestId}`;
        const body = { isApproved };

        console.log('📡 NameChangeService.processNameChangeRequest called');
        console.log('   Full URL:', url);
        console.log('   Request ID:', requestId);
        console.log('   Payload:', body);
        console.log('   Method: PATCH');
        console.log('   With Credentials: true');

        // Endpoint corrected to match backend: approveOrRejectNameChangeRequest
        return this.http.patch<any>(url, body, {
            withCredentials: true
        });
    }
}

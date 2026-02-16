import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetAllActivityLogsResponse } from '../../../interfaces/admin/activity-log';

@Injectable({
    providedIn: 'root'
})
export class ActivityLogService {
    private readonly baseUrl = `${environment.apiBaseUrl}/activitylogs`;

    constructor(private http: HttpClient) { }

    getAllActivityLogs(
        page: number = 1,
        limit: number = 10,
        search?: string,
        actionType?: string,
        startDate?: string,
        endDate?: string
    ): Observable<GetAllActivityLogsResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (search) params = params.set('search', search);
        if (actionType && actionType !== 'All') params = params.set('actionType', actionType);
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        return this.http.get<GetAllActivityLogsResponse>(`${this.baseUrl}/getAllActivityLogs`, {
            params,
            withCredentials: true
        });
    }
}

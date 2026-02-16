import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { CategoryAgeGroupsResponse } from '../../../interfaces/student/category/category';

@Injectable({ providedIn: 'root' })
export class StudentCategoryService {
    private readonly baseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    getAllAgeGroups(): Observable<CategoryAgeGroupsResponse> {
        const url = `${this.baseUrl}/category/getAllAgeGroups`;
        return this.http
            .get<CategoryAgeGroupsResponse>(url, { withCredentials: true })
            .pipe(catchError((err) => throwError(() => err)));
    }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
    CreateCategoryPayload,
    UpdateCategoryPayload,
    ApiResponse,
    ApiCategoryListResponse,
    CategorySubGroupsResponse,
    CategoryAgeGroupsResponse,
    CategoryLevelsResponse
} from '../../../interfaces/admin/category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private readonly baseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    createCategory(payload: CreateCategoryPayload): Observable<ApiResponse> {
        const url = `${this.baseUrl}/category/createCategory`;

        const formData = new FormData();
        formData.append('categoryName', payload.categoryName);
        formData.append('description', payload.description);
        formData.append('categoryDescription', payload.description);
        formData.append('visibility', payload.visibility);

        payload.subCategory.forEach(item => formData.append('subCategory', item));
        payload.categoryLevel.forEach(item => formData.append('categoryLevel', item));
        payload.categoryAgeGroup.forEach(item => formData.append('categoryAgeGroup', item));

        formData.append('profilePicture', payload.profilePicture);

        return this.http
            .post<ApiResponse>(url, formData, { withCredentials: true })
            .pipe(catchError(this.handleError));
    }

    getAllCategories(page: number = 1, limit: number = 100): Observable<ApiCategoryListResponse> {
        // limit increased to fetch mostly all for dropdown if needed, or implement search dropdown
        const url = `${this.baseUrl}/category/getAllCategory?page=${page}&limit=${limit}`;
        return this.http
            .get<ApiCategoryListResponse>(url, { withCredentials: true })
            .pipe(catchError(this.handleError));
    }

    getAllCategorySubgroups(categoryId: string): Observable<CategorySubGroupsResponse> {
        const url = `${this.baseUrl}/category/getAllCategorySubgroups/${categoryId}`;
        return this.http
            .get<CategorySubGroupsResponse>(url, { withCredentials: true })
            .pipe(catchError(this.handleError));
    }

    getAllCategoryAgeGroups(categoryId: string): Observable<CategoryAgeGroupsResponse> {
        const url = `${this.baseUrl}/category/getAllCategoryAgeGroups/${categoryId}`;
        return this.http
            .get<CategoryAgeGroupsResponse>(url, { withCredentials: true })
            .pipe(catchError(this.handleError));
    }

    getAllCategoryLevels(categoryId: string): Observable<CategoryLevelsResponse> {
        const url = `${this.baseUrl}/category/getAllCategoryLevels/${categoryId}`;
        return this.http
            .get<CategoryLevelsResponse>(url, { withCredentials: true })
            .pipe(catchError(this.handleError));
    }

    updateCategory(payload: UpdateCategoryPayload): Observable<ApiResponse> {
        const url = `${this.baseUrl}/category/updateCategory`;
        const body: any = {
            ...payload,
            categoryDescription: payload.description
        };
        return this.http
            .patch<ApiResponse>(url, body, { withCredentials: true })
            .pipe(catchError(this.handleError));
    }

    deleteCategory(id: string): Observable<ApiResponse> {
        const url = `${this.baseUrl}/category/deleteCategory/${id}`;
        return this.http
            .delete<ApiResponse>(url, { withCredentials: true })
            .pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        return throwError(() => error);
    }
}

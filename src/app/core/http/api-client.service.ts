import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, ApiError, QueryParams, PaginatedResponse } from './api.types';

/**
 * Centralized HTTP client wrapper providing consistent API access patterns.
 * All student services should use this client for HTTP operations.
 */
@Injectable({ providedIn: 'root' })
export class ApiClientService {
    private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

    constructor(private http: HttpClient) { }

    /**
     * GET request with typed response.
     */
    get<T>(path: string, queryParams?: QueryParams): Observable<T> {
        const url = this.buildUrl(path);
        const params = this.buildHttpParams(queryParams);
        return this.http.get<ApiResponse<T>>(url, { params }).pipe(
            map((res) => res.data),
            catchError((err) => this.handleError(err))
        );
    }

    /**
     * GET request returning full API response (including pagination).
     */
    getFullResponse<T>(path: string, queryParams?: QueryParams): Observable<ApiResponse<T>> {
        const url = this.buildUrl(path);
        const params = this.buildHttpParams(queryParams);
        return this.http.get<ApiResponse<T>>(url, { params }).pipe(
            catchError((err) => this.handleError(err))
        );
    }

    /**
     * GET request for paginated lists.
     */
    getPaginated<T>(path: string, queryParams?: QueryParams): Observable<PaginatedResponse<T>> {
        const url = this.buildUrl(path);
        const params = this.buildHttpParams(queryParams);
        return this.http.get<PaginatedResponse<T>>(url, { params }).pipe(
            catchError((err) => this.handleError(err))
        );
    }

    /**
     * POST request with JSON body.
     */
    post<T>(path: string, body: unknown): Observable<T> {
        const url = this.buildUrl(path);
        return this.http.post<ApiResponse<T>>(url, body).pipe(
            map((res) => res.data),
            catchError((err) => this.handleError(err))
        );
    }

    /**
     * POST request returning full API response.
     */
    postFullResponse<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
        const url = this.buildUrl(path);
        return this.http.post<ApiResponse<T>>(url, body).pipe(
            catchError((err) => this.handleError(err))
        );
    }

    /**
     * POST request with FormData (multipart/form-data).
     */
    postFormData<T>(path: string, formData: FormData): Observable<T> {
        const url = this.buildUrl(path);
        return this.http.post<ApiResponse<T>>(url, formData).pipe(
            map((res) => res.data),
            catchError((err) => this.handleError(err))
        );
    }

    /**
     * PATCH request with JSON body.
     */
    patch<T>(path: string, body: unknown): Observable<T> {
        const url = this.buildUrl(path);
        return this.http.patch<ApiResponse<T>>(url, body).pipe(
            map((res) => res.data),
            catchError((err) => this.handleError(err))
        );
    }

    /**
     * DELETE request.
     */
    delete<T>(path: string): Observable<T> {
        const url = this.buildUrl(path);
        return this.http.delete<ApiResponse<T>>(url).pipe(
            map((res) => res.data),
            catchError((err) => this.handleError(err))
        );
    }

    /**
     * DELETE request returning full API response.
     */
    deleteFullResponse<T>(path: string): Observable<ApiResponse<T>> {
        const url = this.buildUrl(path);
        return this.http.delete<ApiResponse<T>>(url).pipe(
            catchError((err) => this.handleError(err))
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────

    private buildUrl(path: string): string {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.baseUrl}${cleanPath}`;
    }

    private buildHttpParams(queryParams?: QueryParams): HttpParams {
        let params = new HttpParams();
        if (!queryParams) return params;

        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params = params.set(key, String(value));
            }
        });
        return params;
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        const apiError: ApiError = {
            success: false,
            statusCode: error.status || 0,
            message: this.extractErrorMessage(error),
            errors: error.error?.errors,
            raw: error.error,
        };
        return throwError(() => apiError);
    }

    private extractErrorMessage(error: HttpErrorResponse): string {
        if (error.error?.message) {
            return error.error.message;
        }
        if (error.error?.error) {
            return error.error.error;
        }
        if (error.message) {
            return error.message;
        }
        return 'An unexpected error occurred';
    }
}

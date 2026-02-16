/**
 * Standard API response wrapper used by all backend endpoints.
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalCourses: number;
        limit: number;
    };
}

/**
 * Paginated API response for list endpoints.
 */
export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

/**
 * Standardized API error structure.
 */
export interface ApiError {
    success: false;
    statusCode: number;
    message: string;
    errors?: Record<string, string[]>;
    raw?: unknown;
}

/**
 * Query parameters builder type for list endpoints.
 */
export interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    [key: string]: string | number | boolean | undefined;
}

/**
 * Type guard to check if response is an API error.
 */
export function isApiError(obj: unknown): obj is ApiError {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'success' in obj &&
        (obj as ApiError).success === false
    );
}

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/steam-mind/login.service';
import { ADMIN_SECRET_PATH, getAdminDashboardUrl, getAdminLoginUrl } from '../config/admin-routes.config';

/**
 * HTTP interceptor for centralized error handling.
 * - Normalizes error responses
 * - Handles 401 Unauthorized by triggering logout
 * - Handles 403 Forbidden by redirecting appropriately
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const currentUrl = router.url;
            const isAdminRoute = currentUrl.includes(ADMIN_SECRET_PATH);
            const loginUrl = isAdminRoute ? getAdminLoginUrl() : '/steam-mind/login';

            // Handle authentication errors
            if (error.status === 401) {
                // 🛑 If we are already on the login page, don't redirect (let the component show the error)
                if (currentUrl.includes('/login')) {
                    return throwError(() => error);
                }

                // Clear local auth state and redirect to login
                authService.logout().subscribe({
                    complete: () => {
                        router.navigate([loginUrl], {
                            queryParams: {
                                returnUrl: currentUrl,
                                reason: 'session_expired'
                            },
                        });
                    },
                });
            }

            // Handle forbidden errors (wrong role)
            if (error.status === 403) {
                const role = localStorage.getItem('role');
                if (role) {
                    // Redirect to their dashboard
                    const dashboardRoute = getDashboardByRole(role);
                    router.navigate([dashboardRoute]);
                } else {
                    router.navigate([loginUrl]);
                }
            }

            // Re-throw the error for service-level handling
            return throwError(() => error);
        })
    );
};

function getDashboardByRole(role: string): string {
    if (role === 'instructor') return '/instructor/dashboard';
    if (role === 'student') return '/student';
    // Admin, Manager, etc.
    return getAdminDashboardUrl();
}

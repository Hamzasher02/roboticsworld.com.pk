import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * HTTP interceptor that adds withCredentials: true to all API requests.
 * This ensures cookies (accessToken/refreshToken) are sent with requests.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
    // Only add credentials for requests to our API
    const isApiRequest = req.url.startsWith(environment.apiBaseUrl) ||
        req.url.startsWith('/api');

    if (isApiRequest) {
        const clonedRequest = req.clone({
            withCredentials: true,
        });
        return next(clonedRequest);
    }

    return next(req);
};

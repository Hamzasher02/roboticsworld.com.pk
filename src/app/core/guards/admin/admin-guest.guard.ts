import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../services/admin/Login/auth.service';
import { getAdminDashboardUrl } from '../../config/admin-routes.config';

export const adminGuestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession().pipe(
    map((ok): true | UrlTree => {
      if (ok) {
        const role = localStorage.getItem('role');
        // Only redirect to dashboard if user is NOT a student or instructor
        if (role !== 'student' && role !== 'instructor') {
          return router.createUrlTree([getAdminDashboardUrl()]);
        }
      }
      // If not logged in, or logged in as student/instructor, allow the guest page (login)
      return true;
    })
  );
};

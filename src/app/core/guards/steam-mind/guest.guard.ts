import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/steam-mind/login.service';
import { getAdminDashboardUrl } from '../../config/admin-routes.config';

export const guestGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession().pipe(
    map((isLoggedIn): true | UrlTree => {
      // ❌ already logged in → block guest pages
      if (isLoggedIn) {
        const role = localStorage.getItem('role');
        return router.createUrlTree([getDashboardByRole(role)]);
      }

      // ✅ not logged in → allow login / signup
      return true;
    })
  );
};

// helper
function getDashboardByRole(role: string | null): string {
  if (role === 'instructor') return '/instructor/dashboard';
  if (role === 'student') return '/student';
  // All other roles (admin, manager, staff, etc.) go to admin area
  return getAdminDashboardUrl();
}

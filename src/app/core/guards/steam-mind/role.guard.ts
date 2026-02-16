import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/steam-mind/login.service';
import { getAdminDashboardUrl } from '../../config/admin-routes.config';

export const roleGuard = (allowed: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.ensureSession().pipe(
      map((ok): true | UrlTree => {
        if (!ok) {
          return router.createUrlTree(['/steam-mind/login'], {
            queryParams: { returnUrl: state.url },
          });
        }

        const role = localStorage.getItem('role');
        if (role && allowed.includes(role)) return true;

        // ✅ logged-in but wrong role => send to their own dashboard
        return router.createUrlTree([getDashboardByRole(role)]);
      })
    );
  };
};

function getDashboardByRole(role: string | null): string {
  if (role === 'instructor') return '/instructor/dashboard';
  if (role === 'student') return '/student';
  // All other roles (admin, manager, staff, etc.) go to admin area
  return getAdminDashboardUrl();
}

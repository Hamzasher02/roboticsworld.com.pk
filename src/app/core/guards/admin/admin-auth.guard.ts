import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../services/admin/Login/auth.service';
import { getAdminLoginUrl } from '../../config/admin-routes.config';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession().pipe(
    map((ok): true | UrlTree => {
      if (!ok) {
        return router.createUrlTree([getAdminLoginUrl()], { queryParams: { returnUrl: state.url } });
      }

      // ✅ Restrict students and instructors from admin area
      const role = localStorage.getItem('role');
      if (role === 'student' || role === 'instructor') {
        return router.createUrlTree(['/steam-mind/login']);
      }

      // ✅ All other roles are allowed (admin, manager, staff, account, etc.)
      return true;
    })
  );
};

export const adminAuthChildGuard: CanActivateChildFn = (childRoute, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession().pipe(
    map((ok): true | UrlTree => {
      if (!ok) {
        return router.createUrlTree([getAdminLoginUrl()], { queryParams: { returnUrl: state.url } });
      }

      const role = localStorage.getItem('role');
      if (role === 'student' || role === 'instructor') {
        return router.createUrlTree(['/steam-mind/login']);
      }

      return true;
    })
  );
};

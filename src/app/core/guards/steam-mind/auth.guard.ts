import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/steam-mind/login.service'

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession().pipe(
    map((ok): true | UrlTree =>
      ok
        ? true
        : router.createUrlTree(['/steam-mind/login'], {
            queryParams: { returnUrl: state.url },
          })
    )
  );
};

export const authChildGuard: CanActivateChildFn = (childRoute, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession().pipe(
    map((ok): true | UrlTree =>
      ok
        ? true
        : router.createUrlTree(['/steam-mind/login'], {
            queryParams: { returnUrl: state.url },
          })
    )
  );
};

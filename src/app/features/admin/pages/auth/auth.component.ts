import { CommonModule } from '@angular/common';
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../../core/services/admin/Login/auth.service';
import { LoginRequest } from '../../../../core/interfaces/admin/auth';
import { getAdminBasePath, getAdminDashboardUrl } from '../../../../core/config/admin-routes.config';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  model: LoginRequest = { email: '', password: '' };

  loading = false;
  error = '';
  success = '';

  basePath = getAdminBasePath();
  private returnUrl = getAdminDashboardUrl();

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.returnUrl =
      this.route.snapshot.queryParamMap.get('returnUrl') || getAdminDashboardUrl();

    this.auth
      .ensureSession()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ok) => {
        if (ok) this.router.navigateByUrl(this.returnUrl);
      });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.loading) return;

    this.error = '';
    this.success = '';
    this.loading = true;

    this.auth
      .login(this.model)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl),
        error: (err: HttpErrorResponse) => {
          const backend = err?.error;
          this.error =
            typeof backend === 'string'
              ? backend
              : backend?.message ?? backend?.error ?? 'Login failed. Please try again.';
        },
      });
  }
}

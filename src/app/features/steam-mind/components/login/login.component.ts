import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../../core/services/steam-mind/login.service';
import { ApiError, LoginResponse } from '../../../../core/interfaces/steam-mind/login';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnDestroy {
  form = { email: '', password: '' };

  loading = false;
  success = '';
  error = '';
  showPassword = false;

  private sub?: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) { }

  onLogin(): void {
    this.success = '';
    this.error = '';

    const email = this.form.email.trim();
    const password = this.form.password.trim();

    if (!email) {
      this.error = 'Email is required';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Email is required.' });
      return;
    }
    if (!password) {
      this.error = 'Password is required';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Password is required.' });
      return;
    }

    this.loading = true;
    this.sub?.unsubscribe();

    this.sub = this.auth.login({ email, password }).subscribe({
      next: (res: LoginResponse) => {
        this.loading = false;
        this.success = res.message ?? 'Logged in successfully';

        const role = localStorage.getItem('role');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        // ✅ if returnUrl exists, use it (but still role protected by guards)
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }

        // ✅ otherwise go to their dashboard
        this.router.navigateByUrl(getDashboardByRole(role));
      },
      error: (err: ApiError) => {
        this.loading = false;
        this.success = '';
        this.error = err?.message ?? 'Login failed';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error });
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

function getDashboardByRole(role: string | null): string {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'instructor') return '/instructor/dashboard';
  return '/student';
}
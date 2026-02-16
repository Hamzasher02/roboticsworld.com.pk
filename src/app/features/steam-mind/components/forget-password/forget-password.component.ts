import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ForgotPasswordService } from '../../../../core/services/steam-mind/forgot-password.service';

type Step = 'request' | 'otp' | 'reset';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  step: Step = 'request';
  requestValue = '';
  loading = false;

  // OTP (4 digits)
  otp: string[] = ['', '', '', ''];
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  resetForm = {
    password: '',
    confirmPassword: '',
  };

  constructor(
    private messageService: MessageService,
    private forgotPasswordService: ForgotPasswordService,
    private router: Router
  ) { }

  // 1) Request -> OTP
  openOtp() {
    if (!this.requestValue.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter your email address.' });
      return;
    }

    this.loading = true;
    this.forgotPasswordService.sendOtp({ email: this.requestValue.trim() }).subscribe({
      next: (res) => {
        this.loading = false;
        this.step = 'otp';
        this.messageService.add({
          severity: 'success',
          summary: 'OTP Sent',
          detail: res.message || 'A 4-digit code has been sent to your email.'
        });
        setTimeout(() => this.focusOtp(0), 0);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || err.message || 'Failed to send OTP';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  // 2) OTP -> Reset password
  verifyOtp() {
    const code = this.otp.join('').trim();
    if (code.length !== 4) {
      this.messageService.add({ severity: 'warn', summary: 'Incomplete OTP', detail: 'Please enter the full 4-digit code.' });
      return;
    }

    this.loading = true;
    this.forgotPasswordService.verifyOtp({
      email: this.requestValue.trim(),
      otp: code
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.step = 'reset';
        this.messageService.add({ severity: 'success', summary: 'Verified', detail: 'OTP verified. You can now reset your password.' });
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || err.message || 'OTP Verification Failed';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  // 3) Reset password submit
  resetPassword() {
    if (!this.resetForm.password || this.resetForm.password.length < 6) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Password must be at least 6 characters.' });
      return;
    }
    if (this.resetForm.password !== this.resetForm.confirmPassword) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match.' });
      return;
    }

    this.loading = true;
    this.forgotPasswordService.resetPassword({
      email: this.requestValue.trim(),
      otp: this.otp.join('').trim(),
      newPassword: this.resetForm.password,
      confirmNewPassword: this.resetForm.confirmPassword
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password has been reset successfully.' });

        // Redirect to login after successful reset
        setTimeout(() => {
          this.router.navigate(['/steam-mind/login']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || err.message || 'Reset Password Failed';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  resendOtp() {
    this.loading = true;
    this.forgotPasswordService.sendOtp({ email: this.requestValue.trim() }).subscribe({
      next: (res) => {
        this.loading = false;
        this.messageService.add({ severity: 'info', summary: 'OTP Resent', detail: 'Check your email for the new code.' });
        this.otp = ['', '', '', ''];
        setTimeout(() => this.focusOtp(0), 0);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || err.message || 'Failed to resend OTP';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  // OTP UX
  onOtpInput(i: number, e: Event) {
    const input = e.target as HTMLInputElement;
    const v = (input.value || '').replace(/\D/g, '').slice(0, 1);
    this.otp[i] = v;
    input.value = v;

    if (v && i < 3) this.focusOtp(i + 1);
  }

  onOtpKeydown(i: number, e: KeyboardEvent) {
    const key = e.key;

    if (key === 'Backspace') {
      if (this.otp[i]) {
        this.otp[i] = '';
      } else if (i > 0) {
        this.focusOtp(i - 1);
        this.otp[i - 1] = '';
      }
      return;
    }

    if (key === 'ArrowLeft' && i > 0) this.focusOtp(i - 1);
    if (key === 'ArrowRight' && i < 3) this.focusOtp(i + 1);
  }

  private focusOtp(i: number) {
    const el = this.otpInputs?.toArray()?.[i]?.nativeElement;
    if (el) {
      el.focus();
      el.select();
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';

type Step = 'request' | 'otp' | 'reset';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  basePath = getAdminBasePath();
  step: Step = 'request';

  requestValue = '';

  // OTP (4 digits)
  otp: string[] = ['', '', '', ''];
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  resetForm = {
    password: '',
    confirmPassword: '',
  };

  // 1) Request -> OTP
  openOtp() {
    this.step = 'otp';
    setTimeout(() => this.focusOtp(0), 0);
  }

  // 2) OTP -> Reset password
  verifyOtp() {
    // TODO: API verify here
    this.step = 'reset';
  }

  // 3) Reset password submit
  resetPassword() {
    // TODO: API reset password here
    console.log('RESET', this.resetForm);
    // example: go back to request/login screen
    this.step = 'request';
    this.requestValue = '';
    this.otp = ['', '', '', ''];
    this.resetForm = { password: '', confirmPassword: '' };
  }

  resendOtp() {
    // TODO: API resend here
    console.log('RESEND OTP');
    this.otp = ['', '', '', ''];
    setTimeout(() => this.focusOtp(0), 0);
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

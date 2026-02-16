import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SignupDraftService } from '../../../../core/services/steam-mind/signup-draft.service';
import { SignupForm } from '../../../../core/interfaces/steam-mind/signup';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  form: SignupForm = {
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    consentAccepted: false,
  };

  attempted = false;
  showPassword = false;
  showConfirmPassword = false;

  // ✅ keep regex in TS (Angular template parser issue solved)
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    private router: Router,
    private signupDraftService: SignupDraftService,
    private messageService: MessageService
  ) { }

  private cleanPhone(raw: string): string {
    return (raw || '').replace(/\D/g, '');
  }

  get emailInvalid(): boolean {
    const v = this.form.email?.trim() || '';
    return !v || !this.emailRegex.test(v);
  }

  get phoneNumberInvalid(): boolean {
    return this.cleanPhone(this.form.phoneNumber).length < 10;
  }

  get passwordInvalid(): boolean {
    const v = this.form.password?.trim() || '';
    return !v || v.length < 6;
  }

  get confirmPasswordInvalid(): boolean {
    const v = this.form.confirmPassword?.trim() || '';
    return !v || v.length < 6;
  }

  get passwordMismatch(): boolean {
    return (
      !!this.form.password &&
      !!this.form.confirmPassword &&
      this.form.password !== this.form.confirmPassword
    );
  }

  get isFormValid(): boolean {
    return (
      !this.emailInvalid &&
      !this.phoneNumberInvalid &&
      !this.passwordInvalid &&
      !this.confirmPasswordInvalid &&
      !this.passwordMismatch &&
      this.form.consentAccepted === true
    );
  }

  onSignupNext() {
    this.attempted = true;

    if (this.emailInvalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter a valid email address.' });
      return;
    }
    if (this.phoneNumberInvalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Phone number must be at least 10 digits.' });
      return;
    }
    if (this.passwordInvalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Password must be at least 6 characters.' });
      return;
    }
    if (this.confirmPasswordInvalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please confirm your password.' });
      return;
    }
    if (this.passwordMismatch) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match.' });
      return;
    }
    if (!this.form.consentAccepted) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please accept the terms and conditions.' });
      return;
    }

    if (!this.isFormValid) return;

    this.signupDraftService.add(this.form);
    this.router.navigate(['/steam-mind/choose-role']);
  }
}

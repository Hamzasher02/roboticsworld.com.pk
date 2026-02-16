import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentRegistrationService } from '../../../../core/services/student/student-registration/student-registration.service';
import { SignupDraftService } from '../../../../core/services/steam-mind/signup-draft.service';
import {
  StudentRegisterPayload,
  StudentAuthError,
} from '../../../../core/interfaces/student/student-registration/student-registration';
import { MessageService } from 'primeng/api';
import { StudentCategoryService } from '../../../../core/services/student/category/category.service';

/**
 * StudentProfileComponent - Student Registration Form
 * 
 * This component handles student registration and email verification.
 * It does NOT affect instructor auth in any way.
 * 
 * API Endpoints Used (student-only):
 * - POST /auth/register/student (multipart/form-data)
 * - POST /auth/verifyEmailAddress (email + otp)
 */
@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.css',
})
export class StudentProfileComponent implements OnInit {
  // Form data bindings (matching existing HTML template)
  personal = {
    firstName: '',
    lastName: '',
    fatherName: '',
    email: '',
    phone: '',
    parentPhone: '',
    age: '',
    ageGroup: '',
    dob: '',
    bio: '',
    avatarFile: null as File | null,
    avatarPreview: '' as string,
  };

  residence = {
    address: '',
    city: '',
    country: '',
    postalCode: '',
  };

  emergency = {
    fullName: '',
    relationship: '',
    phone: '',
  };

  security = {
    password: '',
    confirmPassword: '',
  };

  // Password Visibility
  showPassword = false;
  showConfirmPassword = false;

  // -----------------------------
  // OTP Modal State
  // -----------------------------
  showOtpModal = false;
  showVerifiedModal = false;

  otpDigits: string[] = ['', '', '', ''];
  otpError = '';
  isVerifying = false;

  // -----------------------------
  // Registration State
  // -----------------------------
  isRegistering = false;
  registrationError = '';

  ageGroups: string[] = [];

  constructor(
    private studentRegistrationService: StudentRegistrationService,
    private signupDraftService: SignupDraftService,
    private studentCategoryService: StudentCategoryService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadDraftData();
    this.fetchAgeGroups();
  }

  private fetchAgeGroups(): void {
    this.studentCategoryService.getAllAgeGroups().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.ageGroups = res.data;
        }
      },
      error: (err) => {
        console.error('[StudentProfile] Error fetching age groups:', err);
      }
    });
  }

  private loadDraftData(): void {
    const draft = this.signupDraftService.getLatest();
    if (draft) {
      console.log('[StudentAuth] Loading draft data:', { email: draft.email });
      this.personal.email = draft.email || '';
      this.personal.phone = draft.phoneNumber || '';
      this.security.password = draft.password || '';
      this.security.confirmPassword = draft.confirmPassword || '';
    }
  }

  toggleVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showConfirmPassword = !this.showConfirmPassword;
  }

  // -----------------------------
  // Avatar
  // -----------------------------
  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    this.personal.avatarFile = file;

    const reader = new FileReader();
    reader.onload = () => (this.personal.avatarPreview = String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  // -----------------------------
  // DOB Calendar opener (native date picker)
  // -----------------------------
  openDobPicker(input: HTMLInputElement) {
    const anyInput = input as any;
    if (typeof anyInput.showPicker === 'function') {
      anyInput.showPicker();
    } else {
      input.focus();
      input.click();
    }
  }

  // -----------------------------
  // Registration Flow
  // -----------------------------
  private validateForm(): boolean {
    const nameRegex = /^[a-zA-Z\s]{3,15}$/;
    const phoneRegex = /^\+\d{7,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. First Name
    if (!this.personal.firstName || this.personal.firstName.length < 3 || this.personal.firstName.length > 15) {
      this.showValidationError('First name must be 3–15 characters');
      return false;
    }

    // 2. Last Name
    if (!this.personal.lastName || this.personal.lastName.length < 3 || this.personal.lastName.length > 15) {
      this.showValidationError('Last name must be 3–15 characters');
      return false;
    }

    // 3. Father Name
    if (!this.personal.fatherName || this.personal.fatherName.length < 3 || this.personal.fatherName.length > 15) {
      this.showValidationError('Father name must be 3–15 characters');
      return false;
    }

    // 4. Email
    if (!this.personal.email || !emailRegex.test(this.personal.email)) {
      this.showValidationError('Invalid email format');
      return false;
    }

    // 5. Phone
    if (!this.personal.phone || !phoneRegex.test(this.personal.phone)) {
      this.showValidationError('Phone number must be in international format (e.g., +923001234567)');
      return false;
    }

    // 6. Parent Phone
    if (!this.personal.parentPhone || !phoneRegex.test(this.personal.parentPhone)) {
      this.showValidationError('Parent phone number must be in international format');
      return false;
    }

    // 7. Age
    const ageNum = parseInt(this.personal.age);
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
      this.showValidationError('Age must be between 5–100');
      return false;
    }

    // 8. Residence - City
    if (!this.residence.city || this.residence.city.length < 3 || this.residence.city.length > 15) {
      this.showValidationError('City must be 3–15 characters');
      return false;
    }

    // 9. Residence - Others
    if (!this.residence.address || !this.residence.country) {
      this.showValidationError('Please fill in complete residence address and country.');
      return false;
    }

    // 10. Postal Code
    const postalNum = parseInt(this.residence.postalCode);
    if (isNaN(postalNum) || postalNum < 100 || postalNum > 999999999) {
      this.showValidationError('Postal code must be between 100–999999999');
      return false;
    }

    // 11. Emergency Phone
    if (!this.emergency.phone || !phoneRegex.test(this.emergency.phone)) {
      this.showValidationError('Emergency phone must be in international format (e.g., +923001234567)');
      return false;
    }

    // 12. Security - Password
    if (!this.security.password || this.security.password.length < 6) {
      this.showValidationError('Password must be at least 6 characters.');
      return false;
    }

    // 13. Security - Confirm
    if (this.security.password !== this.security.confirmPassword) {
      this.showValidationError('Passwords do not match.');
      return false;
    }

    return true;
  }

  private showValidationError(message: string) {
    this.registrationError = message;
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  saveChanges() {
    // Clear previous errors
    this.registrationError = '';
    this.otpError = '';

    // Sequential Validation
    if (!this.validateForm()) {
      return;
    }

    // Build payload - field names MUST match backend exactly
    const payload: StudentRegisterPayload = {
      // Personal
      firstName: this.personal.firstName,
      lastName: this.personal.lastName,
      fatherName: this.personal.fatherName,
      email: this.personal.email,
      password: this.security.password,
      phoneNumber: this.personal.phone,
      dateOfBirth: this.personal.dob,
      bio: this.personal.bio,

      // Meta
      consentAccepted: true, // Implied consent by clicking signup

      // Student Specific
      parentPhoneNumber: this.personal.parentPhone || '',
      ageGroup: this.personal.ageGroup || '',
      age: this.personal.age || '0',

      // Residence
      address: this.residence.address,
      city: this.residence.city,
      country: this.residence.country,
      postalCode: this.residence.postalCode,

      // Emergency
      fullName: this.emergency.fullName,
      relationship: this.emergency.relationship,
      emergencyPhoneNumber: this.emergency.phone,

      // Optional File
      profilePicture: this.personal.avatarFile || undefined,
    };

    console.log('[StudentAuth] Starting registration with payload:', {
      ...payload,
      password: '[REDACTED]',
      profilePicture: payload.profilePicture ? '[File]' : 'none',
    });

    this.isRegistering = true;

    this.studentRegistrationService.registerStudent(payload).subscribe({
      next: (response) => {
        console.log('[StudentAuth] Registration successful:', response);
        this.isRegistering = false;

        if (response.success) {
          // Registration successful - show OTP modal
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Registration complete! Please verify your email.' });
          console.log('[StudentAuth] ✅ Opening OTP modal for email:', this.personal.email);
          this.openOtpModal();
        } else {
          // Backend returned success=false
          this.registrationError = response.message || 'Registration failed. Please try again.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.registrationError });
          console.warn('[StudentAuth] Backend returned success=false:', response.message);
        }
      },
      error: (err: StudentAuthError) => {
        console.error('[StudentAuth] ❌ Registration error:', err);
        this.isRegistering = false;
        this.registrationError = err.message || 'Registration failed. Please try again.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.registrationError });

        // Log detailed error for debugging
        if (err.raw) {
          console.error('[StudentAuth] Raw error response:', err.raw);
        }
      },
    });
  }

  openOtpModal() {
    this.otpError = '';
    this.otpDigits = ['', '', '', ''];
    this.showOtpModal = true;

    setTimeout(() => this.focusOtp(0), 0);
  }

  closeOtpModal() {
    this.showOtpModal = false;
  }

  // -----------------------------
  // OTP Inputs Logic
  // -----------------------------
  onOtpInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    let val = (input.value || '').replace(/\D/g, '');
    if (val.length > 1) val = val.charAt(val.length - 1);

    this.otpDigits[index] = val;
    this.otpError = '';

    if (val && index < 3) this.focusOtp(index + 1);
  }

  onOtpKeyDown(index: number, event: KeyboardEvent) {
    const key = event.key;

    if (key === 'Backspace') {
      if (this.otpDigits[index]) {
        this.otpDigits[index] = '';
        return;
      }
      if (index > 0) {
        this.focusOtp(index - 1);
        this.otpDigits[index - 1] = '';
      }
      return;
    }

    if (key === 'ArrowLeft' && index > 0) {
      this.focusOtp(index - 1);
      return;
    }

    if (key === 'ArrowRight' && index < 3) {
      this.focusOtp(index + 1);
      return;
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') || '';
    const digits = pasted.replace(/\D/g, '').slice(0, 4).split('');
    if (!digits.length) return;

    event.preventDefault();
    for (let i = 0; i < 4; i++) {
      this.otpDigits[i] = digits[i] || '';
    }

    const last = Math.min(digits.length, 4) - 1;
    this.focusOtp(last >= 0 ? last : 0);
  }

  private focusOtp(index: number) {
    const el = document.getElementById(`otp-${index}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  }

  private getOtpValue() {
    return this.otpDigits.join('');
  }

  // -----------------------------
  // Verify OTP - Real API Call
  // -----------------------------
  async verifyOtp() {
    const otp = this.getOtpValue();

    if (otp.length !== 4) {
      this.otpError = 'Please enter 4-digit OTP';
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: this.otpError });
      return;
    }

    this.isVerifying = true;
    this.otpError = '';

    console.log('[StudentAuth] Verifying OTP for email:', this.personal.email);

    this.studentRegistrationService.verifyEmail({
      email: this.personal.email,
      otp: otp,
    }).subscribe({
      next: (response) => {
        console.log('[StudentAuth] Verify email response:', response);
        this.isVerifying = false;

        if (response.success) {
          console.log('[StudentAuth] ✅ Email verified successfully');
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Email verified successfully!' });
          this.showOtpModal = false;
          this.showVerifiedModal = true;
        } else {
          this.otpError = response.message || 'Invalid OTP. Please try again.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.otpError });
          console.warn('[StudentAuth] Verification failed:', response.message);
        }
      },
      error: (err: StudentAuthError) => {
        console.error('[StudentAuth] ❌ OTP verification error:', err);
        this.isVerifying = false;
        this.otpError = err.message || 'Invalid OTP. Please try again.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.otpError });
      },
    });
  }

  // -----------------------------
  // Resend OTP - Real API Call
  // -----------------------------
  async resendOtp() {
    this.otpError = '';
    this.otpDigits = ['', '', '', ''];
    this.focusOtp(0);

    console.log('[StudentAuth] Resending OTP to:', this.personal.email);

    this.studentRegistrationService.resendOtp(this.personal.email).subscribe({
      next: (response) => {
        console.log('[StudentAuth] Resend OTP response:', response);
        if (response.success) {
          console.log('[StudentAuth] ✅ OTP resent successfully');
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'OTP has been resent to your email.' });
        } else {
          this.otpError = response.message || 'Failed to resend OTP.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.otpError });
        }
      },
      error: (err: StudentAuthError) => {
        console.error('[StudentAuth] ❌ Resend OTP error:', err);
        this.otpError = err.message || 'Failed to resend OTP. Please try again.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.otpError });
      },
    });
  }

  // -----------------------------
  // After Verified
  // -----------------------------
  goToDashboard() {
    this.showVerifiedModal = false;
    this.router.navigate(['/student']);
  }
}

// ✅ src/app/features/steam-mind/pages/edit-profile/edit-profile.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { VerifyEmailService } from '../../../../core/services/steam-mind/verify-email.service';
import { VerifyEmailResponse } from '../../../../core/interfaces/steam-mind/verify-email';
import { SignupDraftService } from '../../../../core/services/steam-mind/signup-draft.service';
import { UserRole } from '../../../../core/interfaces/steam-mind/signup';
import { InstructorRegisterService } from '../../../../core/services/teacher/instructor-register.service';
import { InstructorRegisterPayload, InstructorRegisterResponse } from '../../../../core/interfaces/teacher/instructor-register';
import { PublicCoursesService } from '../../../../core/services/teacher/public-courses/public-courses.service';
import { PublicCourseMin } from '../../../../core/interfaces/teacher/public-courses/public-courses';
import { MessageService } from 'primeng/api';

type FieldKey =
  | 'firstName'
  | 'lastName'
  | 'fatherName'
  | 'phone'
  | 'dob'
  | 'bio'
  | 'address'
  | 'city'
  | 'country'
  | 'postalCode'
  | 'emergencyFullName'
  | 'relationship'
  | 'emergencyPhone'
  | 'qualification'
  | 'degreeTitle'
  | 'graduationYear'
  | 'totalMarks'
  | 'obtainedMarks'
  | 'institution'
  | 'password'
  | 'confirmPassword'
  | 'coursePreferences'
  | 'avatarFile'
  | 'transcriptFile';
@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-profile.component.html',
})
export class EditProfileComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  constructor(
    private router: Router,
    private signupDraftService: SignupDraftService,
    private instructorRegisterService: InstructorRegisterService,
    private publicCoursesService: PublicCoursesService,
    private verifyEmailService: VerifyEmailService,
    private messageService: MessageService
  ) { }
  // OTP UI State 
  showOtpModal = false;
  showVerifiedModal = false;
  otpDigits: string[] = ['', '', '', ''];
  otpError = '';
  isVerifying = false;
  private pendingVerifyEmail = '';
  openOtpModal() { this.showOtpModal = true; }
  closeOtpModal() { this.showOtpModal = false; }
  openVerifiedModal() { this.showVerifiedModal = true; }
  closeVerifiedModal() { this.showVerifiedModal = false; }
  onOtpInput(index: number, e: Event): void {
    const input = e.target as HTMLInputElement;
    const val = (input.value || '').replace(/\D/g, '').slice(0, 1);
    this.otpDigits[index] = val;
    input.value = val;
    this.otpError = '';
    // auto-focus next

    if (val && index < 3) {
      const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null;
      next?.focus();
    }
  }
  onOtpKeyDown(index: number, e: KeyboardEvent): void {

    if (e.key === 'Backspace' && !this.otpDigits[index] && index > 0) {

      const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement | null;

      prev?.focus();

    }

  }
  onOtpPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 4);
    for (let i = 0; i < 4; i++) this.otpDigits[i] = text[i] || '';
    (document.getElementById('otp-3') as HTMLInputElement | null)?.focus();
    this.otpError = '';
  }
  verifyOtp(): void {
    this.otpError = '';
    const otp = this.otpDigits.join('').trim();
    if (otp.length !== 4) {
      this.otpError = 'Please enter 4-digit OTP.';
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: this.otpError });
      return;
    }
    const email = (this.pendingVerifyEmail || this.personal.email || '').trim();
    if (!email) {
      this.otpError = 'Email missing. Please signup again.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: this.otpError });
      return;
    }
    this.isVerifying = true;
    const sub = this.verifyEmailService
      .verifyEmail({ email, otp })
      .pipe(finalize(() => (this.isVerifying = false)))
      .subscribe({
        next: (res: VerifyEmailResponse) => {
          if (res?.success) {
            // ✅ close OTP modal

            this.showOtpModal = false;
            // ✅ show verified modal first (warna navigate se modal show nahi hota)
            this.showVerifiedModal = true;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Email verified successfully!' });
            // ✅ then navigate after short delay
            setTimeout(() => {
              this.showVerifiedModal = false;
              this.router.navigate(['/steam-mind/login']);
            }, 900);
          } else {
            this.otpError = Array.isArray(res?.message)
              ? res.message.join('\n')
              : (res?.message || 'OTP verification failed.');
            this.messageService.add({ severity: 'error', summary: 'Error', detail: this.otpError });
          }
        },
        error: (e) => {
          const msg = e?.error?.message || e?.message || 'OTP verification failed.';
          this.otpError = Array.isArray(msg) ? msg.join('\n') : String(msg);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.otpError });
        },
      });
    this.subs.add(sub);
  }

  resendOtp(): void {
    // frontend side pe abhi separate resend API nahi hai
    // backend me resend endpoint banay ga to yahan call kr lena
    this.otpError = '';
    this.submitSuccessMsg = 'OTP already sent to your email. Please check inbox/spam.';
  }
  // Courses (API)
  courses: PublicCourseMin[] = [];
  isCoursesLoading = false;
  coursesError = '';
  // Files 
  avatarFile: File | null = null;
  transcriptFile: File | null = null;
  private avatarObjectUrl: string | null = null;
  // UI state
  isSubmitting = false;
  submitError = '';
  submitSuccessMsg = '';
  selectedRole: UserRole | null = null;
  // ✅ field validation state
  attempted = false;
  touched: Partial<Record<FieldKey, boolean>> = {};
  errors: Partial<Record<FieldKey, string>> = {};
  // Header
  user = {
    name: 'Vako Shvili',
    id: 'ID-INST-223',
    avatar: 'https://i.pravatar.cc/80?img=12',
  };
  // Forms (ngModel)
  personal = {
    firstName: '',
    lastName: '',
    fatherName: '',
    email: '',
    phone: '',
    dob: '',
    bio: '',
  };
  security = {
    password: '',
    confirmPassword: '',
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
  academic = {
    qualification: '',
    degreeTitle: '',
    graduationYear: '',
    totalMarks: '',
    obtainedMarks: '',
    institution: '',
  };
  teaching = {
    preferredCourse: '',
    items: [] as string[],
  };
  ngOnInit(): void {
    const draft = this.signupDraftService.getLatest();
    this.selectedRole = this.signupDraftService.getRole();
    if (!draft || this.selectedRole !== 'instructor') {
      this.router.navigate(['/steam-mind/signup']);
      return;
    }
    this.personal.email = draft.email;
    this.personal.phone = draft.phoneNumber;
    this.security.password = draft.password;
    this.security.confirmPassword = draft.confirmPassword;
    this.loadCourses();
  }
  ngOnDestroy(): void {
    // ✅ unsubscribe all ongoing observables
    this.subs.unsubscribe();
    if (this.avatarObjectUrl) URL.revokeObjectURL(this.avatarObjectUrl);
  }
  // Courses API
  loadCourses(): void {
    this.isCoursesLoading = true;
    this.coursesError = '';
    const sub = this.publicCoursesService
      .getPublicCoursesMin()
      .pipe(finalize(() => (this.isCoursesLoading = false)))
      .subscribe({
        next: (list) => {
          this.courses = list ?? [];
          if (!this.courses.length) this.coursesError = 'No courses available right now.';
        },
        error: (e) => {
          this.courses = [];
          this.coursesError = e?.error?.message || e?.message || 'Failed to load courses. Please try again.';
        },
      });
    this.subs.add(sub);
  }
  // Helpers
  openDobPicker(input: HTMLInputElement) {
    const anyInput = input as any;
    if (typeof anyInput.showPicker === 'function') anyInput.showPicker();
    else {
      input.focus();
      input.click();
    }
  }

  getCourseTitleById(id: string): string {
    const course = this.courses.find((c) => c._id === id);
    return course?.courseTitle || id;
  }
  // ✅ Validation helpers
  private name3to15(v: string): boolean {
    return /^[A-Za-z\s]{3,15}$/.test((v || '').trim());
  }
  private phoneIntl(v: string): boolean {
    return /^\+[1-9]\d{9,14}$/.test((v || '').trim());
  }
  private yearValid(v: string): boolean {
    const y = Number((v || '').trim());
    const now = new Date().getFullYear();
    return Number.isInteger(y) && y >= 1900 && y <= now;
  }
  private toNum(v: string): number {
    return Number(String(v ?? '').trim());
  }
  private isNumeric(v: string): boolean {
    const n = this.toNum(v);
    return Number.isFinite(n);
  }
  private isPositive(v: string): boolean {
    const n = this.toNum(v);
    return Number.isFinite(n) && n > 0;
  }
  validateField(key: FieldKey): void {
    let err = '';
    switch (key) {
      case 'firstName':
        if (!this.name3to15(this.personal.firstName)) err = 'First name must be 3–15 characters.';
        break;
      case 'lastName':
        if (!this.name3to15(this.personal.lastName)) err = 'Last name must be 3–15 characters.';
        break;
      case 'fatherName':
        if (!this.name3to15(this.personal.fatherName)) err = 'Father name must be 3–15 characters.';
        break;
      case 'phone':
        if (!this.phoneIntl(this.personal.phone)) err = 'Phone must be like +923001234567.';
        break;
      case 'dob':
        if (!this.personal.dob) err = 'Date of Birth is required.';
        break;
      case 'bio':
        if (!this.personal.bio.trim()) err = 'Bio is required.';
        break;
      case 'address':
        if (!this.residence.address.trim()) err = 'Address is required.';
        break;
      case 'city':
        if (!this.name3to15(this.residence.city)) err = 'City must be 3–15 characters.';
        break;
      case 'country':
        if (!this.residence.country) err = 'Country is required.';
        break;
      case 'postalCode': {
        const pc = this.toNum(this.residence.postalCode);
        if (!Number.isFinite(pc) || pc < 100 || pc > 999999999) err = 'Postal code must be 100–999999999.';
        break;
      }
      case 'emergencyFullName':
        if (!this.emergency.fullName.trim()) err = 'Emergency full name is required.';
        break;
      case 'relationship':
        if (!this.emergency.relationship) err = 'Relationship is required.';
        break;
      case 'emergencyPhone':
        if (!this.phoneIntl(this.emergency.phone)) err = 'Emergency phone must be like +923001234567.';
        break;
      case 'qualification':
        if (!this.academic.qualification) err = 'Qualification is required.';
        break;
      case 'degreeTitle':
        if (!this.academic.degreeTitle.trim()) err = 'Degree title is required.';
        break;
      case 'graduationYear':
        if (!this.yearValid(this.academic.graduationYear)) err = 'Graduation year must be a valid year.';
        break;
      case 'totalMarks':
        if (!this.isPositive(this.academic.totalMarks)) err = 'Total marks must be greater than 0.';
        break;
      case 'obtainedMarks':
        if (!this.isNumeric(this.academic.obtainedMarks)) err = 'Obtained marks must be a valid number.';
        break;
      case 'institution':
        if (!this.academic.institution.trim()) err = 'Institution is required.';
        break;
      case 'password':
        if (!this.security.password) err = 'Password is required.';
        break;
      case 'confirmPassword':
        if (!this.security.confirmPassword) err = 'Confirm Password is required.';
        else if (this.security.confirmPassword !== this.security.password) err = 'Passwords must match.';
        break;
      case 'coursePreferences':
        if (!Array.isArray(this.teaching.items) || this.teaching.items.length < 1) err = 'Select at least 1 course.';
        else if (this.teaching.items.length > 5) err = 'Max 5 courses allowed.';
        break;
      case 'avatarFile':
        if (!this.avatarFile) err = 'Avatar image is required.';
        break;
      case 'transcriptFile':
        if (!this.transcriptFile) err = 'Transcript PDF is required.';
        break;
    }

    if (err) this.errors[key] = err;
    else delete this.errors[key];
  }
  markTouched(key: FieldKey): void {
    this.touched[key] = true;
    this.validateField(key);
  }
  shouldShowError(key: FieldKey): boolean {
    return !!this.errors[key] && (this.attempted || (this.touched[key] ?? false));
  }
  inputClass(key: FieldKey): string {
    const base = 'h-10 w-full rounded-lg border bg-[#F9F6F6] px-3 text-sm outline-none focus:border-cyan-500';
    const ok = 'border-cyan-200';
    const bad = 'border-red-400 focus:border-red-500';
    return `${base} ${this.shouldShowError(key) ? bad : ok}`;
  }
  textareaClass(key: FieldKey): string {
    const base = 'w-full rounded-lg border bg-[#F9F6F6] px-3 py-2 text-sm outline-none focus:border-cyan-500';
    const ok = 'border-cyan-200';
    const bad = 'border-red-400 focus:border-red-500';
    return `${base} ${this.shouldShowError(key) ? bad : ok}`;
  }
  // Courses selection
  addCourse(): void {
    this.submitError = '';
    this.submitSuccessMsg = '';
    const id = (this.teaching.preferredCourse || '').trim();
    if (!id) {
      this.submitError = 'Please select a course from dropdown.';
      return;
    }
    if (this.teaching.items.includes(id)) {
      this.submitError = 'This course is already added.';
      return;
    }
    if (this.teaching.items.length >= 5) {
      this.submitError = 'You can add up to 5 courses only.';
      return;
    }
    this.teaching.items.push(id);
    this.teaching.preferredCourse = '';
    this.validateField('coursePreferences');
  }
  removeCourse(i: number): void {
    this.teaching.items.splice(i, 1);
    this.validateField('coursePreferences');
  }
  // File handlers

  onAvatarSelected(e: Event): void {
    this.submitError = '';
    this.submitSuccessMsg = '';
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.submitError = 'Avatar must be an image file.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: this.submitError });
      input.value = '';
      return;
    }
    this.avatarFile = file;
    if (this.avatarObjectUrl) URL.revokeObjectURL(this.avatarObjectUrl);
    this.avatarObjectUrl = URL.createObjectURL(file);
    this.user.avatar = this.avatarObjectUrl;
    this.validateField('avatarFile');
  }
  onTranscriptSelected(e: Event): void {
    this.submitError = '';
    this.submitSuccessMsg = '';
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.submitError = 'Transcript must be a PDF file.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: this.submitError });
      input.value = '';
      return;
    }
    this.transcriptFile = file;
    this.validateField('transcriptFile');
  }
  // Submit helpers 
  private validateAll(): boolean {
    const keys: FieldKey[] = [
      'firstName',
      'lastName',
      'fatherName',
      'phone',
      'dob',
      'bio',
      'address',
      'city',
      'country',
      'postalCode',
      'emergencyFullName',
      'relationship',
      'emergencyPhone',
      'qualification',
      'degreeTitle',
      'graduationYear',
      'totalMarks',
      'obtainedMarks',
      'institution',
      'password',
      'confirmPassword',
      'coursePreferences',
      'avatarFile',
      'transcriptFile',
    ];
    keys.forEach((k) => {
      this.touched[k] = true;
      this.validateField(k);
    });
    return Object.keys(this.errors).length === 0;
  }
  private formatBackendMessage(msg: any): string {
    if (Array.isArray(msg)) return msg.join('\n');
    const raw = String(msg ?? '').trim();
    if (!raw) return 'Something went wrong.';
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .join('\n');
  }
  // Submit
  saveChanges(): void {
    this.submitError = '';
    this.submitSuccessMsg = '';
    this.attempted = true;
    if (!this.validateAll()) {
      this.submitError = 'Please fix the highlighted fields.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: this.submitError });
      return;
    }
    const payload: InstructorRegisterPayload = {
      firstName: this.personal.firstName.trim(),
      lastName: this.personal.lastName.trim(),
      fatherName: this.personal.fatherName.trim(),
      email: this.personal.email.trim(),
      password: this.security.password,
      phoneNumber: this.personal.phone.trim(),
      dateOfBirth: this.personal.dob,
      bio: this.personal.bio.trim(),
      role: 'instructor',
      consentAccepted: true,
      country: this.residence.country,
      address: this.residence.address.trim(),
      city: this.residence.city.trim(),
      postalCode: String(this.residence.postalCode).trim(),
      fullName: this.emergency.fullName.trim(),
      relationship: this.emergency.relationship,
      emergencyPhoneNumber: this.emergency.phone.trim(),
      qualification: this.academic.qualification,
      degreeTitle: this.academic.degreeTitle.trim(),
      graduationYear: this.academic.graduationYear.trim(),
      totalMarks: String(this.academic.totalMarks).trim(),
      obtainedMarks: String(this.academic.obtainedMarks).trim(),
      institution: this.academic.institution.trim(),

      coursePreferences: [...this.teaching.items],

    };
    const files: File[] = []

    if (this.avatarFile) files.push(this.avatarFile);
    if (this.transcriptFile) files.push(this.transcriptFile);

    this.isSubmitting = true;
    const sub = this.instructorRegisterService
      .registerInstructor(payload, files)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res: InstructorRegisterResponse) => {
          if (res?.success) {
            this.submitSuccessMsg = Array.isArray(res?.message)
              ? res.message.join('\n')
              : (res?.message || 'Instructor registered successfully.');
            this.messageService.add({ severity: 'success', summary: 'Success', detail: this.submitSuccessMsg });
            this.submitError = '';

            // ✅ open OTP modal
            this.pendingVerifyEmail = this.personal.email.trim();
            this.otpDigits = ['', '', '', ''];
            this.otpError = '';
            this.showOtpModal = true;
            this.showVerifiedModal = false;
          } else {
            this.submitError = this.formatBackendMessage(res?.message);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: this.submitError });
            this.submitSuccessMsg = '';
          }
        },
        error: (e) => {
          const msg = e?.error?.message || e?.message || 'Something went wrong.';
          this.submitError = this.formatBackendMessage(msg);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.submitError });
          this.submitSuccessMsg = '';
        },
      });
    this.subs.add(sub);
  }
}
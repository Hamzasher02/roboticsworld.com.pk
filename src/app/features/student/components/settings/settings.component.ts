import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { StudentChangePasswordService } from '../../../../core/services/steam-mind/student-change-password.service';
import { StudentProfileService } from '../../../../core/services/student/profile/student-profile.service';
import { StudentProfileResponse, StudentUpdatePayload } from '../../../../core/interfaces/student/profile/student-profile.interface';
import { AuthService } from '../../../../core/services/steam-mind/login.service';
import { of, throwError, Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  // Profile Fields
  personal: StudentProfileResponse = {
    firstName: '',
    lastName: '',
    email: '', // Read-only typically
    parentPhoneNumber: '',
    phoneNumber: '',
    grade: '',
    bio: '',
    profilePicture: ''
  };

  selectedFile: File | null = null;
  filePreview: string | null = null;
  isProfileSubmitting = false;

  // Password Fields
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  // Visibility Toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;

  // Loading State
  isSubmitting = false;

  // Track original state for partial updates
  private originalPersonal: any = {};

  constructor(
    private changePasswordService: StudentChangePasswordService,
    private studentProfileService: StudentProfileService,
    private authService: AuthService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.studentProfileService.getStudentProfile().subscribe({
      next: (data) => {
        // Merge response into personal object
        this.personal = { ...this.personal, ...data };

        // Clone for change detection
        this.originalPersonal = JSON.parse(JSON.stringify(this.personal));

        // Handle profile picture preview
        this.updateFilePreview(this.personal.profilePicture);

        // ✅ Sync AuthService to update headers immediately
        this.authService.updateUser({
          firstName: this.personal.firstName,
          lastName: this.personal.lastName,
          email: this.personal.email,
          profilePicture: this.personal.profilePicture
        });
      },
      error: (err) => {
        // Fallback: Try getting from AuthService if API fails (optional optimization)
        const user = this.authService.getCurrentUser();
        if (user) {
          this.personal.firstName = user.firstName;
          this.personal.lastName = user.lastName;
          this.personal.email = user.email;
          this.personal.profilePicture = user.profilePicture; // Ensure this is synced for preview

          this.originalPersonal = JSON.parse(JSON.stringify(this.personal));
          this.updateFilePreview(user.profilePicture);
        }
      }
    });
  }

  updateFilePreview(pic: string | { secureUrl: string } | undefined): void {
    if (!pic) return;
    if (typeof pic === 'string') {
      this.filePreview = pic;
    } else if (pic.secureUrl) {
      this.filePreview = pic.secureUrl;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.filePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onUploadClick(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  saveProfileChanges(): void {
    this.isProfileSubmitting = true;

    const formData = new FormData();
    let hasChanges = false;

    // Helper to append only if changed
    const appendIfChanged = (key: string, current: string | undefined | null, original: string | undefined | null) => {
      if ((current || '') !== (original || '')) {
        formData.append(key, current || '');
        hasChanges = true;
      }
    };

    appendIfChanged('parentPhoneNumber', this.personal.parentPhoneNumber, this.originalPersonal.parentPhoneNumber);
    appendIfChanged('phoneNumber', this.personal.phoneNumber, this.originalPersonal.phoneNumber);
    appendIfChanged('grade', this.personal.grade, this.originalPersonal.grade);
    appendIfChanged('bio', this.personal.bio, this.originalPersonal.bio);

    // Append profile picture ONLY if new file selected
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
      hasChanges = true;
    }

    if (!hasChanges) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes',
        detail: 'No changes were detected to save.'
      });
      this.isProfileSubmitting = false;
      return;
    }

    // Call update API directly with FormData
    this.studentProfileService.updateStudentInformation(formData).pipe(
      switchMap((res) => {
        return this.authService.ensureSession();
      }),
      catchError((err: any) => {
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile updated successfully.'
        });
        this.isProfileSubmitting = false;

        // Reset file selection
        this.selectedFile = null;
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        // Reload to sync
        this.loadProfile();
      },
      error: (err: any) => {
        const msg = err.message || 'Failed to update profile.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: msg
        });
        this.isProfileSubmitting = false;
      }
    });
  }

  onChangePassword(): void {
    // 1. Basic Validation
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill in all password fields.'
      });
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'New passwords do not match.'
      });
      return;
    }

    if (this.newPassword.length < 6) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'New password must be at least 6 characters long.'
      });
      return;
    }

    // 2. API Call (Uses PATCH method via ChangePasswordService)
    this.isSubmitting = true;
    const payload = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword
    };

    this.changePasswordService.changePassword(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message || 'Password changed successfully.'
        });
        this.resetPasswordFields();
        this.isSubmitting = false;
      },
      error: (err) => {
        const errorMessage = (err.error && err.error.message) || err.message || 'Failed to change password. Please try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.isSubmitting = false;
      }
    });
  }

  toggleVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmNewPassword = !this.showConfirmNewPassword;
  }

  private resetPasswordFields(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }
}

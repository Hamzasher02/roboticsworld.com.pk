import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';

import { PublicCoursesService } from '../../../../core/services/teacher/public-courses/public-courses.service';
import { PublicCourseMin } from '../../../../core/interfaces/teacher/public-courses/public-courses';

import { ChangePasswordService } from '../../../../core/services/steam-mind/change-password/change-password.service';
import { ChangePasswordRequest } from '../../../../core/interfaces/steam-mind/change-password/change-password';

import { InstructorProfileService } from '../../../../core/services/teacher/profile-services/instructor-profile.service';
import {
  GetInstructorProfileResponse,
  InstructorProfileDto,
} from '../../../../core/interfaces/teacher/profile/instructor-profile';

import { InstructorAvailabilityService } from '../../../../core/services/teacher/availability-services/instructor-availability.service';
import {
  DayCode,
  GetMyAvailabilityResponse,
  InstructorAvailabilitySlot,
} from '../../../../core/interfaces/teacher/availability/instructor-availability';

type AvailabilityUiItem = {
  day: string;       // "Monday", "Wednes.."
  time: string;      // "9:00 PM - 10:00 PM" OR "No Availability"
  available: boolean;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private changePasswordService: ChangePasswordService,
    private instructorProfileService: InstructorProfileService,
    private instructorAvailabilityService: InstructorAvailabilityService,
    private publicCoursesService: PublicCoursesService
  ) { }

  // ✅ loading/error for profile
  isProfileLoading = false;
  profileLoadError = '';

  // ✅ Availability loading/error
  isAvailabilityLoading = false;
  availabilityError = '';

  showChangePassword = false;

  // ✅ Change Password state
  isChangingPassword = false;
  changePasswordError = '';
  changePasswordSuccess = '';

  passwordForm: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  // ✅ keep dto (optional for later use)
  instructorDto: InstructorProfileDto | null = null;

  // ✅ header
  user = {
    name: '—',
    id: '—',
    avatar: '',
  };

  profile = {
    email: '—',
    phoneNumber: '—',
    address: '—',      // backend me nahi abhi
    dateOfBirth: '—',  // backend me nahi abhi
    bio: '—',
  };

  academic = {
    qualification: '—',
    degreeTitle: '—',
    graduationYear: '—',
    totalMarks: '—',
    obtainedMarks: '—',
    institution: '—',
    transcript: '—',
  };

  // ✅ Course preferences - dynamically loaded from API
  coursePreferences: { id: string; name: string }[] = [];
  isCoursePrefsLoading = false;
  coursePrefsError = '';

  // ✅ Availability UI-only state
  availabilityMeta = '0 Slots are available';
  availabilityUi: AvailabilityUiItem[] = [
    { day: 'Monday', time: 'No Availability', available: false },
    { day: 'Tuesday', time: 'No Availability', available: false },
    { day: 'Wednes..', time: 'No Availability', available: false },
    { day: 'Thursd..', time: 'No Availability', available: false },
    { day: 'Friday', time: 'No Availability', available: false },
    { day: 'Saturday', time: 'No Availability', available: false },
    { day: 'Sunday', time: 'No Availability', available: false },
  ];

  ngOnInit(): void {
    const navState = history.state as any;

    if (navState?.profileUpdated) {
      this.changePasswordSuccess = navState?.message || 'Profile updated successfully.';
      // optional: auto hide message
      setTimeout(() => (this.changePasswordSuccess = ''), 2500);
    }

    this.fetchInstructorProfile();
    this.fetchAvailability();
  }

  // =========================
  // Profile
  // =========================
  private fetchInstructorProfile(): void {
    this.profileLoadError = '';
    this.isProfileLoading = true;
    this.isCoursePrefsLoading = true;
    this.coursePrefsError = '';

    // ✅ Fetch both instructor profile and public courses in parallel
    forkJoin({
      profile: this.instructorProfileService.getProfile(),
      courses: this.publicCoursesService.getPublicCoursesMin(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isProfileLoading = false;
          this.isCoursePrefsLoading = false;
        })
      )
      .subscribe({
        next: ({ profile: res, courses }) => {
          if (!res?.success) {
            this.profileLoadError = res?.message || 'Unable to load profile.';
            return;
          }

          // FIX: API returns data as array, extract first element
          const d = Array.isArray(res.data) ? res.data[0] : res.data;
          if (!d) {
            this.profileLoadError = 'No profile data found.';
            return;
          }
          this.instructorDto = d;

          this.user = {
            name: d?.name || '—',
            id: d?.id || '—',
            avatar: d?.profilePicture || '',
          };

          // FIX: Bind address from residenceInfo and dob from root
          this.profile = {
  email: d?.email || '—',
  phoneNumber: d?.phoneNumber || '—',
  address: d?.residenceInfo?.address || '—',
  dateOfBirth: this.formatDate(d?.dateOfBirth) || '—', // ✅ FIX
  bio: d?.bio || '—',
};


          // FIX: Use nested academicInfo object from API response
          const academic = d?.academicInfo;
          this.academic = {
            qualification: academic?.qualification || '—',
            degreeTitle: academic?.degreeTitle || '—',
            graduationYear: typeof academic?.graduationYear === 'number' ? String(academic.graduationYear) : '—',
            totalMarks: typeof academic?.totalMarks === 'number' ? String(academic.totalMarks) : '—',
            obtainedMarks: typeof academic?.obtainedMarks === 'number' ? String(academic.obtainedMarks) : '—',
            institution: academic?.institution || '—',
            transcript: academic?.transcript || '—',
          };

          // ✅ Map course preference IDs to course names
          this.mapCoursePreferences(academic?.coursePreferences || [], courses);
        },
        error: (err) => {
          this.profileLoadError =
            err?.error?.message || err?.message || 'Something went wrong while loading profile.';
          this.coursePrefsError = 'Unable to load course preferences.';
        },
      });
  }

  /**
   * Maps course preference IDs to their names using the public courses list
   */
  private mapCoursePreferences(preferenceIds: string[], allCourses: PublicCourseMin[]): void {
    if (!preferenceIds?.length) {
      this.coursePreferences = [];
      return;
    }

    // Create a map for quick lookup: id -> courseTitle
    const courseMap = new Map<string, string>();
    for (const course of allCourses) {
      courseMap.set(course._id, course.courseTitle);
    }

    // Map preference IDs to objects with id and name
    this.coursePreferences = preferenceIds
      .map((id) => ({
        id,
        name: courseMap.get(id) || 'Unknown Course',
      }))
      .filter((pref) => pref.name !== 'Unknown Course'); // Optionally filter out unknown courses
  }

  // ✅ transcript view
  openTranscript(): void {
    const url = this.academic?.transcript;
    if (!url || url === '—') return;
    window.open(url, '_blank');
  }

  goToEditProfile(): void {
    this.router.navigate(['/instructor/profile/edit-profile']);
  }

  // =========================
  // Availability (API -> UI)
  // =========================
  private fetchAvailability(): void {
    this.availabilityError = '';
    this.isAvailabilityLoading = true;

    this.instructorAvailabilityService
      .getMySlots()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isAvailabilityLoading = false))
      )
      .subscribe({
        next: (res: GetMyAvailabilityResponse) => {
          if (!res?.success) {
            this.availabilityError = res?.message || 'Unable to load availability.';
            this.applyAvailabilityToUi([]); // fallback
            return;
          }

          // ✅ UI me sirf data apply karna: days + time
          const slots = Array.isArray(res.data) ? res.data : [];
          this.applyAvailabilityToUi(slots);

          // ✅ meta badge: "X Slots are available"
          const activeSlots =
            typeof res?.summary?.activeSlots === 'number'
              ? res.summary.activeSlots
              : slots.filter((s) => s?.isActive).length;

          this.availabilityMeta = `${activeSlots} Slots are available`;
        },
        error: (err) => {
          this.availabilityError =
            err?.error?.message || err?.message || 'Something went wrong while loading availability.';
          this.applyAvailabilityToUi([]); // fallback
          this.availabilityMeta = '0 Slots are available';
        },
      });
  }

  private applyAvailabilityToUi(slots: InstructorAvailabilitySlot[]): void {
    // We only need: days + (startTime/endTime) + isActive
    // slots can include multiple days e.g. ["MON","WED","FRI"].
    const dayOrder: DayCode[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    const labelMap: Record<DayCode, string> = {
      MON: 'Monday',
      TUE: 'Tuesday',
      WED: 'Wednes..',
      THU: 'Thursd..',
      FRI: 'Friday',
      SAT: 'Saturday',
      SUN: 'Sunday',
    };

    // Build a map dayCode -> time strings
    const dayToTimes = new Map<DayCode, string[]>();

    for (const slot of slots || []) {
      if (!slot?.isActive) continue;

      const days = Array.isArray(slot?.days) ? slot.days : [];
      const time = this.formatRange(slot?.startTime, slot?.endTime);
      if (!time) continue;

      for (const d of days) {
        if (!dayToTimes.has(d)) dayToTimes.set(d, []);
        dayToTimes.get(d)!.push(time);
      }
    }

    this.availabilityUi = dayOrder.map((code) => {
      const times = dayToTimes.get(code) || [];

      // UI design shows only one pill time. If multiple times, show first.
      const timeText = times.length > 0 ? times[0] : 'No Availability';

      return {
        day: labelMap[code],
        time: timeText,
        available: times.length > 0,
      };
    });
  }

  private formatRange(start?: string, end?: string): string {
    // start/end expected: "09:00"
    const s = this.formatTime12h(start);
    const e = this.formatTime12h(end);
    if (!s || !e) return '';
    return `${s} - ${e}`;
  }

  private formatTime12h(hhmm?: string): string {
    if (!hhmm || typeof hhmm !== 'string') return '';
    const parts = hhmm.split(':');
    if (parts.length < 2) return '';

    const hh = Number(parts[0]);
    const mm = Number(parts[1]);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return '';

    const ampm = hh >= 12 ? 'PM' : 'AM';
    let h12 = hh % 12;
    if (h12 === 0) h12 = 12;

    const mmStr = String(mm).padStart(2, '0');
    return `${h12}:${mmStr} ${ampm}`;
  }

  private formatDate(iso?: string): string {
  if (!iso) return '';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '';
  // UI-friendly format: 02 Feb 2005
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

  // =========================
  // Change password
  // =========================
  handleChangePassword(): void {
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
    this.showChangePassword = true;
  }

  cancelChangePassword(): void {
    this.showChangePassword = false;
    this.isChangingPassword = false;
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
    this.passwordForm = { currentPassword: '', newPassword: '', confirmNewPassword: '' };
  }

  updatePassword(): void {
    this.changePasswordError = '';
    this.changePasswordSuccess = '';

    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm;

    if (!currentPassword?.trim() || !newPassword?.trim() || !confirmNewPassword?.trim()) {
      this.changePasswordError = 'All password fields are required.';
      return;
    }

    if (newPassword !== confirmNewPassword) {
      this.changePasswordError = 'New password and confirm password do not match.';
      return;
    }

    this.isChangingPassword = true;

    this.changePasswordService
      .changePassword(this.passwordForm)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isChangingPassword = false))
      )
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.changePasswordSuccess = res.message || 'Password changed successfully.';
            this.cancelChangePassword();
          } else {
            this.changePasswordError = res?.message || 'Unable to change password.';
          }
        },
        error: (err) => {
          this.changePasswordError =
            err?.error?.message || err?.message || 'Something went wrong while changing password.';
        },
      });
  }
}

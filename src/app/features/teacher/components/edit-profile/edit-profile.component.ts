// edit-profile.component.ts
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InstructorProfileService } from '../../../../core/services/teacher/profile-services/instructor-profile.service';
import {
  GetInstructorProfileResponse,
  InstructorProfileDto,
} from '../../../../core/interfaces/teacher/profile/instructor-profile';

import { PublicCoursesService } from '../../../../core/services/teacher/public-courses/public-courses.service';
import { PublicCourseMin } from '../../../../core/interfaces/teacher/public-courses/public-courses';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile.component.html',
})
export class EditProfileComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private instructorProfileService: InstructorProfileService,
    private publicCoursesService: PublicCoursesService
  ) { }

  // ✅ page load state
  isLoadingProfile = false;
  loadError = '';

  // ✅ saving state
  isSaving = false;
  saveError = '';
  saveSuccess = '';

  // ✅ success modal (we keep ONLY this one)
  showVerifiedModal = false;

  // ✅ keep dto (optional)
  instructorDto: InstructorProfileDto | null = null;

  // ✅ store picked files (NOT changing UI)
  private selectedAvatarFile: File | null = null;
  private selectedTranscriptFile: File | null = null;

  // Top header
  user = { name: '—', id: '—', avatar: 'https://i.pravatar.cc/80?img=12' };

  // Personal Info
  personal = {
    firstName: '',
    lastName: '',
    fatherName: '',
    email: '',
    phone: '',
    dob: '',
    bio: '',
  };

  // Residence
  residence = {
    address: '',
    city: '',
    country: '',
    postalCode: '',
  };

  // Emergency
  emergency = {
    fullName: '',
    relationship: '',
    phone: '',
  };

  // Academic
  academic = {
    qualification: '',
    degreeTitle: '',
    graduationYear: '',
    totalCgpa: '',
    obtainedCgpa: '',
    institution: '',
    transcriptName: '',
  };

  // Teaching course prefs
  teaching = {
    preferredCourse: '', // stores the selected course ID
    items: [] as { id: string; name: string }[], // stores objects with id and name
  };

  // ✅ All public courses for dropdown
  allCourses: PublicCourseMin[] = [];
  isCoursesLoading = false;

  // ✅ Map for quick lookup: courseId -> courseName
  private courseMap = new Map<string, string>();

  // Account security (UI exists, BUT update API is separate)
  security = {
    password: '',
    confirmPassword: '',
  };

  ngOnInit(): void {
    this.fetchAndPatchProfile();
  }

  // =========================
  // GET profile -> patch form
  // =========================
  private fetchAndPatchProfile(): void {
    this.loadError = '';
    this.isLoadingProfile = true;
    this.isCoursesLoading = true;

    // ✅ Fetch both instructor profile and public courses in parallel
    forkJoin({
      profile: this.instructorProfileService.getProfile(),
      courses: this.publicCoursesService.getPublicCoursesMin(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoadingProfile = false;
          this.isCoursesLoading = false;
        })
      )
      .subscribe({
        next: ({ profile: res, courses }) => {
          // ✅ Store all courses and build lookup map
          this.allCourses = courses || [];
          this.courseMap.clear();
          for (const c of this.allCourses) {
            this.courseMap.set(c._id, c.courseTitle);
          }

          if (!res?.success) {
            this.loadError = res?.message || 'Unable to load profile.';
            return;
          }

          const d = Array.isArray(res.data) ? res.data[0] : (res.data as any);
          if (!d) {
            this.loadError = 'No profile data found.';
            return;
          }

          this.instructorDto = d;

          // header
          this.user = {
            name: d?.name || '—',
            id: d?.id || '—',
            avatar: d?.profilePicture || this.user.avatar,
          };

          // best-effort name split (because backend gives `name` only)
          const fullName = (d?.name || '').trim();
          const parts = fullName ? fullName.split(' ') : [];
          const firstName = parts.length ? parts[0] : '';
          const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

          // Personal
          this.personal = {
            firstName,
            lastName,
            fatherName: '',
            email: d?.email || '',
            phone: d?.phoneNumber || '',
            dob: d?.dob || '',
            bio: d?.bio || '',
          };

          // Residence
          this.residence = {
            address: d?.residenceInfo?.address || '',
            city: d?.residenceInfo?.city || '',
            country: d?.residenceInfo?.country || '',
            postalCode: d?.residenceInfo?.postalCode || '',
          };

          // Emergency
          this.emergency = {
            fullName: d?.emergencyInfo?.fullName || '',
            relationship: d?.emergencyInfo?.relationship || '',
            phone: d?.emergencyInfo?.phoneNumber || '',
          };

          // Academic
          const a = d?.academicInfo;
          this.academic = {
            qualification: a?.qualification || '',
            degreeTitle: a?.degreeTitle || '',
            graduationYear:
              typeof a?.graduationYear === 'number' ? String(a.graduationYear) : '',
            totalCgpa: a?.totalMarks != null ? String(a.totalMarks) : '',
            obtainedCgpa: a?.obtainedMarks != null ? String(a.obtainedMarks) : '',
            institution: a?.institution || '',
            transcriptName: a?.transcript ? this.getFileName(a.transcript) : '',
          };

          // ✅ Teaching preferences - map IDs to objects with id and name
          const preferenceIds: string[] = Array.isArray(a?.coursePreferences)
            ? [...a!.coursePreferences!]
            : [];
          this.teaching.items = preferenceIds.map((id) => ({
            id,
            name: this.courseMap.get(id) || 'Unknown Course',
          }));
        },
        error: (err) => {
          this.loadError =
            err?.error?.message ||
            err?.message ||
            'Something went wrong while loading profile.';
        },
      });
  }

  private getFileName(url: string): string {
    try {
      const clean = url.split('?')[0];
      const name = clean.substring(clean.lastIndexOf('/') + 1);
      return name || '';
    } catch {
      return '';
    }
  }

  // =========================
  // File pickers
  // =========================
  onTranscriptSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;

    this.selectedTranscriptFile = f;
    this.academic.transcriptName = f.name;
  }

  onAvatarSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;

    this.selectedAvatarFile = f;

    // preview only
    this.user.avatar = URL.createObjectURL(f);
  }

  // =========================
  // Teaching chips
  // =========================
  addCourse() {
    const courseId = this.teaching.preferredCourse;
    if (!courseId) return;

    // Check if course already exists in items
    if (this.teaching.items.some((item) => item.id === courseId)) return;
    if (this.teaching.items.length >= 5) return;

    // Get the course name from the map
    const courseName = this.courseMap.get(courseId) || 'Unknown Course';
    this.teaching.items.push({ id: courseId, name: courseName });
    this.teaching.preferredCourse = '';
  }

  removeCourse(i: number) {
    this.teaching.items.splice(i, 1);
  }

  /**
   * Helper to check if a course is already selected
   */
  isCourseSelected(courseId: string): boolean {
    return this.teaching.items.some((item) => item.id === courseId);
  }

  // =========================
  // Save flow (OTP REMOVED)
  // =========================
  saveChanges() {
    this.performUpdate();
  }

  // =========================
  // UPDATE APIs
  // =========================
  private performUpdate(): void {
    this.saveError = '';
    this.saveSuccess = '';
    this.showVerifiedModal = false;
    this.isSaving = true;

  // 1) updateInstructorInformation (FormData)
const infoFd = new FormData();
infoFd.append('firstName', this.personal.firstName || '');
infoFd.append('lastName', this.personal.lastName || '');
infoFd.append('fatherName', this.personal.fatherName || '');
infoFd.append('phoneNumber', this.personal.phone || '');
infoFd.append('email', this.personal.email || '');
infoFd.append('dateOfBirth', this.personal.dob || '');
infoFd.append('bio', this.personal.bio || '');

infoFd.append('address', this.residence.address || '');
infoFd.append('city', this.residence.city || '');
infoFd.append('country', this.residence.country || '');
infoFd.append('postalCode', this.residence.postalCode || '');

infoFd.append('emergencyFullName', this.emergency.fullName || '');
infoFd.append('emergencyRelationship', this.emergency.relationship || '');
infoFd.append('emergencyPhoneNo', this.emergency.phone || '');

// profile picture
if (this.selectedAvatarFile) {
  infoFd.append('profilePicture', this.selectedAvatarFile);
}

// ✅ ADD HERE (IMPORTANT)
if (this.teaching.items?.length) {
  this.teaching.items.forEach((item) => {
    infoFd.append('coursePreferences', item.id);
  });
}


// 2) updateInstructorAcademicDetails (FormData)
const academicFd = new FormData();
academicFd.append('qualification', this.academic.qualification || '');
academicFd.append('degreeTitle', this.academic.degreeTitle || '');
academicFd.append('graduationYear', this.academic.graduationYear || '');
academicFd.append('totalMarks', this.academic.totalCgpa || '');
academicFd.append('obtainedMarks', this.academic.obtainedCgpa || '');
academicFd.append('institution', this.academic.institution || '');

// transcript file
if (this.selectedTranscriptFile) {
  academicFd.append('transcript', this.selectedTranscriptFile);
}


    forkJoin({
      info: this.instructorProfileService.updateInstructorInformation(infoFd),
      academic: this.instructorProfileService.updateInstructorAcademicDetails(academicFd),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSaving = false))
      )
      .subscribe({
        next: (res) => {
          if (!res.info?.success) {
            this.saveError =
              res.info?.message || 'Failed to update instructor information.';
            return;
          }
          if (!res.academic?.success) {
            this.saveError =
              res.academic?.message || 'Failed to update academic details.';
            return;
          }

          // ✅ success message
          this.saveSuccess =
            res.info?.message || 'Profile updated successfully.';

          // ✅ (optional) refresh edit form
          this.fetchAndPatchProfile();

          // ✅ navigate to profile page with state
          setTimeout(() => {
            this.router.navigate(['/instructor/profile'], {
              state: { profileUpdated: true, message: this.saveSuccess },
            });
          }, 700);
        },
        error: (err) => {
          this.saveError =
            err?.error?.message ||
            err?.message ||
            'Something went wrong while saving profile.';
        },
      });
  }

  // success modal button action (still here if you need it somewhere else)
  goToDashboard(): void {
    this.showVerifiedModal = false;
    this.router.navigate(['/instructor/dashboard']);
  }
  openDobPicker(input: HTMLInputElement): void {
    // focus for all browsers
    input?.focus();

    // Chrome/Edge: opens native picker
    const anyInput = input as any;
    if (anyInput?.showPicker) {
      anyInput.showPicker();
    }
  }
}

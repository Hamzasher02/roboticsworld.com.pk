// =========================================
// profile-header.component.ts (COMPLETE)
// - ✅ get instructor profile from API
// - ✅ show name/email/avatar from response
// - ✅ no UI change (same HTML)
// =========================================

import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InstructorProfileService } from '../../../../core/services/teacher/profile-services/instructor-profile.service';
import { InstructorProfileDto } from '../../../../core/interfaces/teacher/profile/instructor-profile';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.css'],
})
export class ProfileHeaderComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private profileApi: InstructorProfileService
  ) {}

  // ✅ UI model (same fields used in HTML)
  instructor = {
    name: '—',
    email: '—',
    avatarUrl: '',
  };

  loading = false;

  ngOnInit(): void {
    this.fetchProfile();
  }

  private fetchProfile(): void {
    this.loading = true;

    this.profileApi
      .getProfile()
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          const p: InstructorProfileDto | null = res?.data?.[0] ?? null;
          if (!p) return;

          this.instructor = {
            name: p.name ?? '—',
            email: p.email ?? '—',
            avatarUrl: p.profilePicture ?? '',
          };
        },
        error: (err) => {
          console.error('getInstructorProfile API error:', err);
          // keep fallback UI values
        },
      });
  }

  onEditProfile(): void {
    this.router.navigate(['/instructor/profile/edit-profile']);
  }
}

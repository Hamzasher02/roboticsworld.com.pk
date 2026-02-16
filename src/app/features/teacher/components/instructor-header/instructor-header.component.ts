import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InstructorProfileService } from '../../../../core/services/teacher/profile-services/instructor-profile.service';
import { InstructorProfileDto } from '../../../../core/interfaces/teacher/profile/instructor-profile';

interface Notification {
  id: number;
  message: string;
  time: string;
  isUnread: boolean;
  avatarUrl: string;
  details?: {
    fileLink?: string;
    fileSize?: string;
    actionButton?: string;
  };
}

@Component({
  selector: 'app-instructor-header',
  standalone: true,
  imports: [CommonModule, NotificationListComponent],
  templateUrl: './instructor-header.component.html',
  styleUrl: './instructor-header.component.css',
})
export class InstructorHeaderComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private profileApi: InstructorProfileService
  ) {}

  headerData = {
    logoPath: 'assets/instructor-images/header/logo.png',
    appName: 'STEAM Minds',
  };

  // ✅ dynamic user info
  userName = '—';
  userAvatar = '';
  userRoleLabel = 'Instructor';

  // 🔔 Notifications Panel States
  showNotifications = false;
  notificationCount = 0;

  // Filters
  currentFilter: 'All' | 'Unread' | 'Read' = 'All';

  allNotifications: Notification[] = [
    {
      id: 1,
      message: 'New enrollment request from Sara Ali.',
      time: '5 mins ago',
      isUnread: true,
      avatarUrl: 'assets/users/avatar1.png',
    },
    {
      id: 2,
      message: 'File "AnnualReport.pdf" uploaded.',
      time: '1 hour ago',
      isUnread: true,
      avatarUrl: 'assets/users/avatar2.png',
      details: { fileLink: 'Download Report', fileSize: '1.2MB' },
    },
    {
      id: 3,
      message: 'Your password was changed successfully.',
      time: '2 hours ago',
      isUnread: false,
      avatarUrl: 'assets/users/avatar3.png',
    },
    {
      id: 4,
      message: 'Query received from instructor Mike.',
      time: 'Yesterday',
      isUnread: false,
      avatarUrl: 'assets/users/avatar4.png',
      details: { actionButton: 'Reply Now' },
    },
  ];

  filteredNotifications: Notification[] = [];

  loadingProfile = false;

  ngOnInit() {
    this.filteredNotifications = this.allNotifications;
    this.updateNotificationCount();

    // ✅ load profile for header
    this.fetchInstructorProfile();
  }

  private fetchInstructorProfile(): void {
    this.loadingProfile = true;

    this.profileApi
      .getProfile()
      .pipe(
        finalize(() => (this.loadingProfile = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          const p: InstructorProfileDto | null = res?.data?.[0] ?? null;
          if (!p) return;

          this.userName = p.name ?? '—';
          this.userRoleLabel = (p.role ?? 'Instructor').toString();
          this.userRoleLabel =
            this.userRoleLabel.length > 0
              ? this.userRoleLabel.charAt(0).toUpperCase() + this.userRoleLabel.slice(1)
              : 'Instructor';

          this.userAvatar =
            p.profilePicture?.trim() || '';
        },
        error: (err) => {
          console.error('getInstructorProfile API error:', err);
          // keep fallbacks
        },
      });
  }

  updateNotificationCount() {
    this.notificationCount = this.allNotifications.filter((n) => n.isUnread).length;
  }

  // 🔔 navigate to notifications page
  openNotifications() {
    this.router.navigate(['/instructor/dashboard/notifications']);
  }

  // 🔎 Filters
  setFilter(filter: 'All' | 'Unread' | 'Read') {
    this.currentFilter = filter;

    switch (filter) {
      case 'Unread':
        this.filteredNotifications = this.allNotifications.filter((n) => n.isUnread);
        break;

      case 'Read':
        this.filteredNotifications = this.allNotifications.filter((n) => !n.isUnread);
        break;

      default:
        this.filteredNotifications = this.allNotifications;
    }
  }

  // ✅ avatar fallback (image error)
  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) img.src = '';
  }
}

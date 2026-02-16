import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/admin/Login/auth.service';
import { Router } from '@angular/router';
import { LoginUserData } from '../../../../core/interfaces/admin/auth';
import { getAdminLoginUrl } from '../../../../core/config/admin-routes.config';

export interface Notification {
  id: number;
  type: 'session_start' | 'alert' | 'notes_upload' | 'technical_issue';
  message: string;
  time: string;
  isUnread: boolean;
  avatarUrl: string;
  details?: {
    fileLink?: string;
    fileSize?: string;
    actionButton?: 'Open' | 'Read';
  };
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  notificationCount = 7;
  userName = '';
  userAvatar = '';

  user: LoginUserData | null = null;

  isNotificationPanelOpen = false;
  isUserMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.userName = `${user.firstName} ${user.lastName}`;
        this.userAvatar = user.profilePicture || '';
      }
    });
  }

  avatarFallback(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  }

  // OPEN / CLOSE NOTIFICATION PANEL
  toggleNotificationPanel() {
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
  }

  // USER MENU FUNCTIONS
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate([getAdminLoginUrl()]);
      },
      error: () => {
        // Fallback even if API fails
        this.router.navigate([getAdminLoginUrl()]);
      }
    });
  }

  // CLICK OUTSIDE DETECTION
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.relative')) {
      this.isUserMenuOpen = false;
    }
  }


  // NOTIFICATION DATA
  notifications: Notification[] = [
    {
      id: 1, type: 'session_start', isUnread: true, time: 'Last Wednesday at 9:42 AM', avatarUrl: '/assets/admin/Admin.svg',
      message: "Live session 'Intro to JavaScript' starts in 1 hour.",
      details: { actionButton: 'Open' }
    },
    {
      id: 2, type: 'alert', isUnread: false, time: 'Last Wednesday at 9:42 AM', avatarUrl: '/assets/admin/Admin.svg',
      message: "No confirmation from instructor John Doe."
    },
    {
      id: 3, type: 'session_start', isUnread: true, time: 'Last Wednesday at 9:42 AM', avatarUrl: '/assets/admin/Admin.svg',
      message: "CSS Layout Techniques session has started."
    }
  ];

  currentFilter: 'All' | 'Unread' | 'Read' = 'All';

  get filteredNotifications(): Notification[] {
    if (this.currentFilter === 'Unread') return this.notifications.filter(n => n.isUnread);
    if (this.currentFilter === 'Read') return this.notifications.filter(n => !n.isUnread);
    return this.notifications;
  }

  setFilter(filter: 'All' | 'Unread' | 'Read') {
    this.currentFilter = filter;
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // CommonModule for *ngFor, *ngIf, etc.

// Notification interface
interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  timestamp: Date;
  status: 'live' | 'upcoming';
  actionLabel: string;
}

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, DatePipe], 
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css'] 
})
export class NotificationListComponent {
  notifications: Notification[] = [
    { id: 1, message: "Live session 'Intro to JavaScript' starts in 5 min. Ensure instructor and materials are ready", isRead: false, timestamp: new Date('2025-12-10T09:42:00'), status: 'live', actionLabel: 'Open' },
    { id: 2, message: "Live session 'CSS Layout Techniques' has started.", isRead: false, timestamp: new Date('2025-12-10T09:42:00'), status: 'live', actionLabel: 'Open' },
    { id: 3, message: "Live session 'Intro to JavaScript' starts in 1 hour. Ensure instructor and materials are ready", isRead: false, timestamp: new Date('2025-12-10T09:42:00'), status: 'upcoming', actionLabel: 'Open' },
    { id: 4, message: "Live session 'Intro to JavaScript' starts in 1 hour. Ensure instructor and materials are ready", isRead: false, timestamp: new Date('2025-12-10T09:42:00'), status: 'upcoming', actionLabel: 'Open' },
    { id: 5, message: "Live session 'Intro to JavaScript' starts in 1 hour. Ensure instructor and materials are ready", isRead: false, timestamp: new Date('2025-12-10T09:42:00'), status: 'upcoming', actionLabel: 'Open' },
  ];

  selectedNotifications: number[] = [];
  filter: 'All' | 'Unread' | 'Read' = 'All';

  get filteredNotifications(): Notification[] {
    if (this.filter === 'Unread') {
      return this.notifications.filter(n => !n.isRead);
    }
    if (this.filter === 'Read') {
      return this.notifications.filter(n => n.isRead);
    }
    return this.notifications;
  }


  toggleSelect(notificationId: number): void {
    const index = this.selectedNotifications.indexOf(notificationId);
    if (index > -1) {
      this.selectedNotifications.splice(index, 1);
    } else {
      this.selectedNotifications.push(notificationId);
    }
  }

  get isAllSelected(): boolean {
    const visibleIds = this.filteredNotifications.map(n => n.id);
    return visibleIds.length > 0 && visibleIds.every(id => this.selectedNotifications.includes(id));
  }

  toggleSelectAll(): void {
    const visibleIds = this.filteredNotifications.map(n => n.id);
    if (this.isAllSelected) {
      this.selectedNotifications = this.selectedNotifications.filter(id => !visibleIds.includes(id));
    } else {
      const newSelections = visibleIds.filter(id => !this.selectedNotifications.includes(id));
      this.selectedNotifications = [...this.selectedNotifications, ...newSelections];
    }
  }

  markAsRead(notificationId?: number): void {
    const idsToMark = notificationId ? [notificationId] : this.selectedNotifications;
    this.notifications = this.notifications.map(n => {
      if (idsToMark.includes(n.id)) {
        return { ...n, isRead: true };
      }
      return n;
    });
    this.selectedNotifications = [];
  }

  deleteNotification(notificationId: number): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.selectedNotifications = this.selectedNotifications.filter(id => id !== notificationId);
  }

  deleteAllSelected(): void {
    this.notifications = this.notifications.filter(n => !this.selectedNotifications.includes(n.id));
    this.selectedNotifications = [];
  }
}

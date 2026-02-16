import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';

@Component({
  selector: 'app-today-session',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './today-session.component.html',
  styleUrl: './today-session.component.css',
})
export class TodaySessionComponent {
  constructor(private router: Router) { }

  // Data for the 'Today's Sessions' table
  sessions = [
    {
      time: '09:00 - 10:30',
      course: 'Advanced JavaScript',
      instructor: { name: 'Emily Johnson', avatar: '/assets/admin/Admin.svg' },
      sessionNumber: '2 of 12',
      status: 'Upcoming',
    },
    {
      time: '11:00 - 12:30',
      course: 'UI/UX Design Principles',
      instructor: { name: 'Michael Chen', avatar: '/assets/admin/Admin.svg' },
      sessionNumber: '2 of 12',
      status: 'Upcoming',
    },
    {
      time: '14:00 - 15:30',
      course: 'Data Science Fundamentals',
      instructor: { name: 'Robert Williams', avatar: '/assets/admin/Admin.svg' },
      sessionNumber: '2 of 12',
      status: 'Upcoming',
    },
    {
      time: '16:00 - 17:30',
      course: 'Digital Marketing Strategy',
      instructor: { name: 'Sarah Thompson', avatar: '/assets/admin/Admin.svg' },
      sessionNumber: '2 of 12',
      status: 'Upcoming',
    },
  ];

  pendingInstructorsCount = 5;

  // Modal control
  isModalOpen: boolean = false;

  upcomingSessions = [
    { title: 'Advanced Javascript', category: 'Technology', instructor: 'James Wilson', date: '2025-05-15', time: '14:00 - 15:30' },
    { title: 'UI/UX Design Principles', category: 'Design', instructor: 'Michael Chen', date: '2025-05-15', time: '11:00 - 12:30' },
    { title: 'Data Science Fundamentals', category: 'Data', instructor: 'Robert Williams', date: '2025-05-15', time: '14:00 - 15:30' },
    { title: 'Digital Marketing Strategy', category: 'Marketing', instructor: 'Sarah Thompson', date: '2025-05-15', time: '16:00 - 17:30' },
  ];

  // Functions to open/close modal
  openViewAllModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onReviewApplications() {
    this.router.navigate([`${getAdminBasePath()}/manage-user`]);
  }
}
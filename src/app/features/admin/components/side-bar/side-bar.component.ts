import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';

interface SidebarItem {
  id: number;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, NgFor, RouterLink, RouterLinkActive],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css',
})
export class SideBarComponent {
  activeRoute: string = '/dashboard';
  private basePath = getAdminBasePath();

  menuItems: SidebarItem[] = [
    { id: 1, label: 'Dashboard', icon: '/assets/admin/sidebaricons/Dashboard.svg', route: `${this.basePath}/dashboard` },
    { id: 2, label: 'Manage User', icon: '/assets/admin/sidebaricons/user.svg', route: `${this.basePath}/manage-user` },
    { id: 3, label: 'Course Management', icon: '/assets/admin/sidebaricons/managecourses.svg', route: `${this.basePath}/course-management` },
    { id: 4, label: 'Quiz Management', icon: '/assets/admin/sidebaricons/quiz.svg', route: `${this.basePath}/coming-soon/quiz` },
    { id: 5, label: 'Manage Requests', icon: '/assets/admin/sidebaricons/managerequest.svg', route: `${this.basePath}/manage-request` },
    { id: 6, label: 'Manage Purchases', icon: '/assets/admin/sidebaricons/managepayment.svg', route: `${this.basePath}/manage-purchases` },
    { id: 7, label: 'Activity log', icon: '/assets/admin/sidebaricons/Worktime.svg', route: `${this.basePath}/activity-log` },
    { id: 8, label: 'Generate Report', icon: '/assets/admin/sidebaricons/File.svg', route: `${this.basePath}/coming-soon/report` },
    { id: 9, label: 'Student Progress', icon: '/assets/admin/sidebaricons/Homework.svg', route: `${this.basePath}/student-progress` },
    { id: 10, label: 'Deletion History', icon: '/assets/admin/sidebaricons/Recyclebin.svg', route: `${this.basePath}/delete-history` },
    { id: 11, label: 'Chat Moderation', icon: '/assets/admin/sidebaricons/Messenger.svg', route: `${this.basePath}/coming-soon/chat` },
    { id: 12, label: 'Website Management', icon: '/assets/admin/sidebaricons/website.svg', route: `${this.basePath}/coming-soon/website` },
  ];
}

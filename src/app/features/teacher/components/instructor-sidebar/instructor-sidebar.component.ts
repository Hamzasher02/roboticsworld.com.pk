import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { LogoutService } from '../../../../core/services/steam-mind/logout/logout.service';

interface SidebarLink {
  iconPath: string; 
  label: string; 
  isActive: boolean; 
  route?: string; // add route property
    isLogout?: boolean; // ✅ new

}

@Component({
  selector: 'app-instructor-sidebar',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './instructor-sidebar.component.html',
  styleUrls: ['./instructor-sidebar.component.css'] 
})
export class InstructorSidebarComponent {


  constructor(
    private router: Router,
    private logoutService: LogoutService
  ) {}
  homeIconPath = '/assets/instructor-images/sidebar/icons8-home-100 (1).svg';
  bookIconPath = '/assets/instructor-images/sidebar/icons8-book-open-100.svg';
  quizIconPath = '/assets/instructor-images/sidebar/Group.svg';
  calendarIconPath = '/assets/instructor-images/sidebar/icons8-calendar-100.svg';
  timeIconPath = '/assets/instructor-images/sidebar/icons8-clock-100 1.svg';
  profileIconPath = '/assets/instructor-images/sidebar/icons8-user-100.svg';
  logoutIconPath = '/assets/instructor-images/sidebar/icons8-logout-100.svg';

  sidebarLinks: SidebarLink[] = [
    { iconPath: this.homeIconPath, label: 'Dashboard', isActive: true, route: '/instructor/dashboard' }, 
    { iconPath: this.bookIconPath, label: 'My Courses', route: '/instructor/courses', isActive: false  },
    { iconPath: this.quizIconPath, label: 'Manage Quiz', route: '/instructor/instructor-quiz', isActive: false },
    { iconPath: this.calendarIconPath, label: 'Manage Sessions', route: '/instructor/manage-sessions', isActive: false },
    { iconPath: this.timeIconPath, label: 'Availability',  route: '/instructor/set-availability', isActive: false },
    { iconPath: this.profileIconPath, label: 'My Profile', route: '/instructor/profile', isActive: false },
  { iconPath: this.logoutIconPath, label: 'Logout', isActive: false, isLogout: true },
  ];
  
 selectLink(link: SidebarLink): void {

    // ✅ Logout Flow
    if (link.isLogout) {
      this.logoutService.logout().subscribe({
        next: () => {
          localStorage.clear(); 
          this.router.navigate(['steam-mind/login']); 
        },
        error: (err) => {
          console.error('Logout failed', err);
        }
      });
      return;
    }

    // ✅ Normal Navigation
    this.sidebarLinks.forEach(l => l.isActive = false);
    link.isActive = true;

    if (link.route) {
      this.router.navigate([link.route]);
    }
  }
}


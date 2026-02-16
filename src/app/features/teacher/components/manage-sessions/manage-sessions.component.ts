// manage-sessions.component.ts
import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';

export type SessionType = 'Live Session' | 'Demo Session';

export interface Session {
  date: string;
  time: string;
  studentName: string;
  studentImage: string;
  sessionNumber: string;
  totalSessions: number;
  type: SessionType;
  courseName: string;
  courseLevel: string;
  moduleName: string;
  meetingLink: string;
}

@Component({
  selector: 'app-manage-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-sessions.component.html',
})
export class ManageSessionsComponent implements AfterViewInit {
  constructor(private router: Router) { }

  ngAfterViewInit() {
    setTimeout(() => initFlowbite(), 0);
  }

  activeTab: 'upcoming' | 'previous' = 'upcoming';
  selectedSessionType: string = 'Session Type';
  selectedSessionTypePrev: string = 'Session Type';

  upcomingSessions: Session[] = [
    {
      date: '20-06-2025',
      time: '09:00 - 10:30',
      studentName: 'Sarah Thompson',
      studentImage: '/assets/instructor-images/courses/Sarah Thompson.svg',
      sessionNumber: '2 of 12',
      totalSessions: 12,
      type: 'Live Session',
      courseName: 'Web Development',
      courseLevel: 'Level 1',
      moduleName: 'Algebra Basics',
      meetingLink: 'https://meet.link/math-algebra',
    },
    {
      date: '20-06-2025',
      time: '09:00 - 10:30',
      studentName: 'Sarah Thompson',
      studentImage: '/assets/instructor-images/courses/Sarah Thompson.svg',
      sessionNumber: '1 of 1',
      totalSessions: 1,
      type: 'Demo Session',
      courseName: 'Web Development',
      courseLevel: 'Level 2',
      moduleName: 'Intro Demo',
      meetingLink: 'https://meet.link/physics-demo',
    },
    {
      date: '21-06-2025',
      time: '11:00 - 12:00',
      studentName: 'Emily Johnson',
      studentImage: '/assets/instructor-images/courses/Emily Johnson.svg',
      sessionNumber: '2 of 12',
      totalSessions: 12,
      type: 'Live Session',
      courseName: 'Web Development',
      courseLevel: 'Level 1',
      moduleName: 'Organic Chemistry',
      meetingLink: 'https://meet.link/chem-organic',
    },
    {
      date: '22-06-2025',
      time: '01:00 - 02:00',
      studentName: 'Michael Chen',
      studentImage: '/assets/instructor-images/courses/Michael Chen.svg',
      sessionNumber: '1 of 8',
      totalSessions: 8,
      type: 'Live Session',
      courseName: 'Computer Science',
      courseLevel: 'Level 1',
      moduleName: 'Data Structures',
      meetingLink: 'https://meet.link/dsa',
    },
    {
      date: '23-06-2025',
      time: '03:00 - 04:00',
      studentName: 'Sarah Thompson',
      studentImage: '/assets/instructor-images/courses/Sarah Thompson.svg',
      sessionNumber: '1 of 1',
      totalSessions: 1,
      type: 'Demo Session',
      courseName: 'English',
      courseLevel: 'Level 1',
      moduleName: 'Speaking Demo',
      meetingLink: 'https://meet.link/english-demo',
    },
  ];

  previousSessions: Session[] = [
    {
      date: '15-05-2025',
      time: '11:00 - 12:30',
      studentName: 'Sarah Thompson',
      studentImage: '/assets/instructor-images/courses/Sarah Thompson.svg',
      sessionNumber: '1 of 12',
      totalSessions: 12,
      type: 'Live Session',
      courseName: 'Web Development',
      courseLevel: 'Level 1',
      moduleName: 'Algebra Basics',
      meetingLink: 'https://meet.link/math-old',
    },
    {
      date: '10-05-2025',
      time: '14:00 - 15:30',
      studentName: 'Emily Johnson',
      studentImage: '/assets/instructor-images/courses/Emily Johnson.svg',
      sessionNumber: '1 of 12',
      totalSessions: 12,
      type: 'Live Session',
      courseName: 'Physics',
      courseLevel: 'Level 2',
      moduleName: 'Mechanics',
      meetingLink: 'https://meet.link/physics-old',
    },
    {
      date: '05-05-2025',
      time: '10:00 - 11:00',
      studentName: 'Michael Chen',
      studentImage: '/assets/instructor-images/courses/Michael Chen.svg',
      sessionNumber: '1 of 12',
      totalSessions: 12,
      type: 'Demo Session',
      courseName: 'Computer Science',
      courseLevel: 'Level 1',
      moduleName: 'Intro Demo',
      meetingLink: 'https://meet.link/cs-demo-old',
    },
  ];

  filteredUpcomingSessions(): Session[] {
    if (this.selectedSessionType === 'Session Type') return this.upcomingSessions;
    return this.upcomingSessions.filter((s) => s.type === this.selectedSessionType);
  }

  filteredPreviousSessions(): Session[] {
    if (this.selectedSessionTypePrev === 'Session Type') return this.previousSessions;
    return this.previousSessions.filter((s) => s.type === this.selectedSessionTypePrev);
  }

  trackByKey(_: number, s: Session): string {
    return `${s.date}-${s.time}-${s.studentName}-${s.type}-${s.courseName}-${s.courseLevel}`;
  }

  goBack() {
    this.router.navigate(['/instructor/dashboard']);
  }
}

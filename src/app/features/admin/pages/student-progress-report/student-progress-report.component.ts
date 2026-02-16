import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

type TabKey = 'overview' | 'session' | 'completion';

@Component({
  selector: 'app-student-progress-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-progress-report.component.html',
  styleUrl: './student-progress-report.component.css',
})
export class StudentProgressReportComponent {
  studentId = '';

  // ✅ dropdown options used in template
  courseOptions: string[] = ['Python Level 1', 'Python Level 2', 'Web Development'];

  categoryOptions: string[] = ['Filter by category', 'Live Classes', 'Recorded', 'Assignments'];
  category: string = this.categoryOptions[0];

  // ✅ ngModel binding used in template
  course: string = this.courseOptions[0];

  completion = {
    percent: 50,
    completed: 6,
    total: 12,
  };

  activeTab: TabKey = 'overview';
  setTab(tab: TabKey) {
    this.activeTab = tab;
  }

  constructor(private route: ActivatedRoute) {
    this.studentId = this.route.snapshot.paramMap.get('id') || '';
    console.log('Student Report ID:', this.studentId);
  }

  // ✅ ONLINE IMAGE URLS
  // pravatar gives random human avatars (great for UI mock)
  readonly fallbackAvatar = 'https://i.pravatar.cc/200?img=64';
  readonly fallbackAvatarLarge = 'https://i.pravatar.cc/400?img=64';

  student = {
    name: 'Ahmed Ali',
    email: 'ahmeda231@gmail.com',
    avatar: 'https://i.pravatar.cc/120?img=12',
    avatarLarge: 'https://i.pravatar.cc/280?img=12',
  };

  session = {
    courseTitle: '2021 Complete Python....',
    dateTime: '1/15/2025 at 10:00 AM - 11:00 AM',
  };

  info = {
    plan: 'Live Classes',
    course: 'Python Level 1',
    enrolledOn: 'Feb 5, 2025',
    validUntil: 'Aug 5, 2025',
    instructor: 'David Miller',
    certificate: 'Not Eligible',
  };

  progress = {
    completed: 6,
    total: 12,
  };

  stats = {
    courseCompletion: 50,
    attendanceRate: 85,
  };

  get progressPercent() {
    return Math.round((this.progress.completed / this.progress.total) * 100);
  }

  goBack() {
    history.back();
  }

  // ✅ if any online image fails, set a working online fallback
  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;

    // avoid infinite loop if fallback also fails
    if (img.src.includes('i.pravatar.cc')) {
      img.src = 'https://placehold.co/200x200/png?text=Avatar';
      return;
    }

    img.src = this.fallbackAvatar;
  }

  sessionRows = [
    {
      title: 'Introduction to Web Development',
      date: 'Feb 20, 2025',
      feedback: 'Great participation during session',
      status: 'Completed',
      attendance: 'Present',
      icon: 'check',
    },
    {
      title: 'Introduction to Web Development',
      date: 'Feb 20, 2025',
      feedback: 'Great participation during session',
      status: 'Completed',
      attendance: 'Present',
      icon: 'check',
    },
    {
      title: 'Introduction to Web Development',
      date: 'Feb 20, 2025',
      feedback: 'Great participation during session',
      status: 'Completed',
      attendance: 'Present',
      icon: 'check',
    },
    {
      title: 'Introduction to Web Development',
      date: 'Feb 28, 2025',
      feedback: 'N/A',
      status: 'Upcoming',
      attendance: '',
      icon: 'clock',
    },
  ];

  get completionDasharray() {
    const r = 36;
    const c = 2 * Math.PI * r;
    const p = Math.max(0, Math.min(100, this.completion.percent));
    const filled = (p / 100) * c;
    const empty = c - filled;
    return `${filled} ${empty}`;
  }

  attendance = {
    presentPercent: 50,
    absentPercent: 15,
    presentLabel: '6 Sessions (50%)',
    absentLabel: '1 Session (15%)',
  };

  modulePerformance = [
    { name: 'HTML & CSS', percent: 95 },
    { name: 'JavaScript', percent: 75 },
    { name: 'API Integration', percent: 65 },
  ];

  instructorRemarks = 'Instructor did not submit any remarks.';

  studentsFeedback = [
    {
      module: 'HTML & CSS Fundamentals',
      message:
        'I found the session very informative and easy to follow. The practical exercises helped me grasp the concepts better.',
      date: 'May 12, 2025',
      rating: 4,
    },
    {
      module: 'JavaScript Basics',
      message:
        'Excellent session! The instructor explained complex concepts in a simple manner. I particularly liked the interactive coding examples.',
      date: 'May 12, 2025',
      rating: 4,
    },
  ];

  starsArray(rating: number): boolean[] {
    const r = Math.max(0, Math.min(5, Math.round(rating)));
    return Array.from({ length: 5 }, (_, i) => i < r);
  }
}

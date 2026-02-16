import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

type TabKey = 'overview' | 'session' | 'completion';
// ===== Course Completion Data =====


@Component({
  selector: 'app-student-progress-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-progress-report.component.html',
  styleUrl: './student-progress-report.component.css',
})
export class StudentProgressReportComponent {
  studentId = '';
  completion = {
  percent: 50,
  completed: 6,
  total: 12,
};

  // ✅ FIX: add activeTab + setter
  activeTab: TabKey = 'overview';
  setTab(tab: TabKey) {
    this.activeTab = tab;
  }

  constructor(private route: ActivatedRoute) {
    this.studentId = this.route.snapshot.paramMap.get('id') || '';
    console.log('Student Report ID:', this.studentId);
  }

  student = {
    name: 'Ahmed Ali',
    email: 'ahmeda231@gmail.com',
    avatar: '/assets/instructor-images/header/Avatar.svg',
    avatarLarge: '/assets/instructor-images/header/Avatar.svg',
  };

  session = {
    courseTitle: '2021 Complete Python....',
    dateTime: '1/15/2025 at 10:00 AM - 11:00 AM',
  };

  info = {
    plan: 'Basic Plan',
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
    avgEngagement: 75,
  };

  get progressPercent() {
    return Math.round((this.progress.completed / this.progress.total) * 100);
  }

  goBack() {
    history.back();
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) img.src = '/assets/instructor-images/header/Avatar.svg';
  }
  // ✅ Session Progress list rows (add inside component class)
sessionRows = [
  {
    title: 'Introduction to Web Development',
    date: 'Feb 20, 2025',
    feedback: 'Great participation during session',
    status: 'Completed',
    attendance: 'Present',
    icon: 'check',          // ✅
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
    icon: 'clock',          // ✅
  },
];
// donut calculation (r=36, circumference ≈ 226.19)
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

// stars helper (0-5)
starsArray(rating: number): boolean[] {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }, (_, i) => i < r);
}

}


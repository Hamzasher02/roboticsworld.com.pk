// overview.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type StatCard = {
  title: string;
  value: string;
  subtitle: string;
  bg: string;
  iconBg: string;
  iconSrc: string;
};

type RecentActivityItem = {
  title: string;
  time: string;
  badgeBg: string;
  icon: 'check' | 'upload' | 'clock' | 'shield';
};

type SubmissionItem = {
  title: string;
  subtitle: string;
  bg: string;
  statusIcon: 'pending' | 'approved';
};

type TopQuizRow = {
  title: string;
  subtitle: string;
  grade: string;
  gradeColor: string;
};

type Instructor = {
  name: string;
  quizzesCreatedText: string;
  count: number;
  avatarUrl: string;
};

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
})
export class OverviewComponent {
  // ======== TOP STATS ========
  statCards: StatCard[] = [
    {
      title: 'Total Quizzes',
      value: '1,247',
      subtitle: '+23 this week',
      bg: '#2563EB',
      iconBg: '#60A5FA',
      iconSrc: '/assets/admin/quiz/allquizes.svg',
    },
    {
      title: 'Published',
      value: '892',
      subtitle: '71.5% of total',
      bg: '#16A34A',
      iconBg: '#4ADE80',
      iconSrc: '/assets/admin/quiz/publish.svg',
    },
    {
      title: 'Under Review',
      value: '156',
      subtitle: 'Pending approval',
      bg: '#D97706',
      iconBg: '#FACC15',
      iconSrc: '/assets/admin/quiz/view.svg',
    },
    {
      title: 'Avg. Completion',
      value: '84.2%',
      subtitle: '+2.1% this month',
      bg: '#9333EA',
      iconBg: '#C084FC',
      iconSrc: '/assets/admin/quiz/completion.svg',
    },
  ];

  // ======== RECENT ACTIVITY ========
  recentActivities: RecentActivityItem[] = [
    {
      title: 'Quiz "Advanced React Concepts" approved',
      time: '2 minutes ago',
      badgeBg: '#DCFCE7',
      icon: 'check',
    },
    {
      title: 'Bulk upload completed: 15 quizzes imported',
      time: '1 hour ago',
      badgeBg: '#DBEAFE',
      icon: 'upload',
    },
    {
      title: 'Quiz "Python Basics" submitted for review',
      time: '3 hours ago',
      badgeBg: '#FEF9C3',
      icon: 'clock',
    },
    {
      title: 'AI generation limit updated for instructor Sarah',
      time: '5 hours ago',
      badgeBg: '#F3E8FF',
      icon: 'shield',
    },
  ];

  // ======== RECENT SUBMISSIONS ========
  recentSubmissions: SubmissionItem[] = [
    {
      title: 'Node.js Basics',
      subtitle: 'Awaiting review',
      bg: '#FFFBEB',
      statusIcon: 'pending',
    },
    {
      title: 'Database Design',
      subtitle: 'Awaiting review',
      bg: '#FFFBEB',
      statusIcon: 'pending',
    },
    {
      title: 'API Development',
      subtitle: 'Recently approved',
      bg: '#ECFDF5',
      statusIcon: 'approved',
    },
  ];

  // ======== PERFORMANCE OVERVIEW ========
  range: '7d' | '30d' = '30d';

  topQuizzes: TopQuizRow[] = [
    { title: 'JavaScript Fundamentals', subtitle: '95.2% completion rate', grade: 'A+', gradeColor: '#16A34A' },
    { title: 'React Components', subtitle: '91.8% completion rate', grade: 'A', gradeColor: '#16A34A' },
    { title: 'CSS Grid Layout', subtitle: '88.4% completion rate', grade: 'B+', gradeColor: '#2563EB' },
  ];

  instructors: Instructor[] = [
    { name: 'Emily Johnson', quizzesCreatedText: '47 quizzes created', count: 47, avatarUrl: 'https://i.pravatar.cc/48?img=12' },
    { name: 'Michael Chen', quizzesCreatedText: '32 quizzes created', count: 32, avatarUrl: 'https://i.pravatar.cc/48?img=33' },
    { name: 'Sarah Thompson', quizzesCreatedText: '28 quizzes created', count: 28, avatarUrl: 'https://i.pravatar.cc/48?img=5' },
  ];

  setRange(next: '7d' | '30d') {
    this.range = next;

    // Hook your API here. For now, demo data switch:
    if (next === '7d') {
      this.topQuizzes = [
        { title: 'JavaScript Fundamentals', subtitle: '96.1% completion rate', grade: 'A+', gradeColor: '#16A34A' },
        { title: 'React Components', subtitle: '92.4% completion rate', grade: 'A', gradeColor: '#16A34A' },
        { title: 'CSS Grid Layout', subtitle: '87.2% completion rate', grade: 'B+', gradeColor: '#2563EB' },
      ];
      this.instructors = [
        { name: 'Emily Johnson', quizzesCreatedText: '12 quizzes created', count: 12, avatarUrl: 'https://i.pravatar.cc/48?img=12' },
        { name: 'Michael Chen', quizzesCreatedText: '9 quizzes created', count: 9, avatarUrl: 'https://i.pravatar.cc/48?img=33' },
        { name: 'Sarah Thompson', quizzesCreatedText: '7 quizzes created', count: 7, avatarUrl: 'https://i.pravatar.cc/48?img=5' },
      ];
    } else {
      this.topQuizzes = [
        { title: 'JavaScript Fundamentals', subtitle: '95.2% completion rate', grade: 'A+', gradeColor: '#16A34A' },
        { title: 'React Components', subtitle: '91.8% completion rate', grade: 'A', gradeColor: '#16A34A' },
        { title: 'CSS Grid Layout', subtitle: '88.4% completion rate', grade: 'B+', gradeColor: '#2563EB' },
      ];
      this.instructors = [
        { name: 'Emily Johnson', quizzesCreatedText: '47 quizzes created', count: 47, avatarUrl: 'https://i.pravatar.cc/48?img=12' },
        { name: 'Michael Chen', quizzesCreatedText: '32 quizzes created', count: 32, avatarUrl: 'https://i.pravatar.cc/48?img=33' },
        { name: 'Sarah Thompson', quizzesCreatedText: '28 quizzes created', count: 28, avatarUrl: 'https://i.pravatar.cc/48?img=5' },
      ];
    }
  }

  activityIconColor(i: RecentActivityItem['icon']): string {
    if (i === 'check') return '#16A34A';
    if (i === 'upload') return '#2563EB';
    if (i === 'clock') return '#CA8A04';
    return '#9333EA';
  }
}

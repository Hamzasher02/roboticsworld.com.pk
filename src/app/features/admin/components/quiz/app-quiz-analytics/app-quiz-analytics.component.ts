import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

type TabKey = 'analytics' | 'performance' | 'questions' | 'settings';

type DistRow = { label: string; value: number; percent: number };
type PeakRow = { range: string; tag: 'High Activity' | 'Medium' | 'Low' };
type MetricRow = { label: string; value: string; color: 'green' | 'orange' | 'blue' };

export type Quiz = {
  title: string;
  id: string;
  instructor: string;
  course: string;
  date: string;
  attempts: number;
  avg: number;
  completion: number;
  instructorAvatar: string;
};

type QPerf = {
  no: string;
  type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  pts: string;
  question: string;
  avgTime: string;
  difficultyRating: string;
  performance: { label: string; tone: 'excellent' | 'good' | 'needs' };
  successRate: number;
};

type QuestionDetail = {
  no: string;
  type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  pts: string;
  question: string;
  successRate: number;
  options: { key: string; text: string; correct?: boolean }[];
};

@Component({
  selector: 'app-quiz-analytics',
  imports: [CommonModule,FormsModule],
  templateUrl: './app-quiz-analytics.component.html',
  styleUrl: './app-quiz-analytics.component.css'
})
export class AppQuizAnalyticsComponent {
  @Input() quiz: Quiz | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Quiz>();

  activeTab: TabKey = 'analytics';

  // ======= Top cards (dynamic) =======
  get totalAttempts(): number {
    return this.quiz?.attempts ?? 0;
  }
  get avgScore(): number {
    return this.quiz?.avg ?? 0;
  }
  get completionRate(): number {
    return this.quiz?.completion ?? 0;
  }

  avgTimeLabel = '12.5m';

  // ======= Analytics data =======
  dist: DistRow[] = [
    { label: '90-100%', value: 45, percent: 18.2 },
    { label: '80-89%', value: 78, percent: 31.6 },
    { label: '70-79%', value: 67, percent: 27.1 },
    { label: '60-69%', value: 34, percent: 13.8 },
    { label: '0-59%', value: 23, percent: 9.3 },
  ];

  peakHours: PeakRow[] = [
    { range: '10:00-11:00', tag: 'High Activity' },
    { range: '14:00-15:00', tag: 'High Activity' },
    { range: '19:00-20:00', tag: 'High Activity' },
  ];

  metrics: MetricRow[] = [
    { label: 'Pass Rate', value: '78.4%', color: 'green' },
    { label: 'Retake Rate', value: '23.6%', color: 'orange' },
    { label: 'First Attempt Success', value: '65.2%', color: 'blue' },
  ];

  // ======= Performance tab =======
  qPerf: QPerf[] = [
    {
      no: 'Q1',
      type: 'Multiple Choice',
      difficulty: 'Easy',
      pts: '2 pts',
      question: 'What is the correct way to declare a variable in JavaScript?',
      avgTime: '45s',
      difficultyRating: 'Easy',
      performance: { label: 'Excellent', tone: 'excellent' },
      successRate: 89.5,
    },
    {
      no: 'Q2',
      type: 'Multiple Choice',
      difficulty: 'Medium',
      pts: '2 pts',
      question: 'Which method is used to add an element to the end of an array?',
      avgTime: '62s',
      difficultyRating: 'Medium',
      performance: { label: 'Good', tone: 'good' },
      successRate: 76.3,
    },
  ];

  // ======= Questions tab =======
  qDetail: QuestionDetail[] = [
    {
      no: 'Q1',
      type: 'Multiple Choice',
      difficulty: 'Easy',
      pts: '2 pts',
      question: 'What is the correct way to declare a variable in JavaScript?',
      successRate: 89.5,
      options: [
        { key: 'A', text: 'var x = 5;', correct: true },
        { key: 'B', text: 'variable x = 5;' },
        { key: 'C', text: 'x = 5;' },
        { key: 'D', text: 'declare x = 5;' },
      ],
    },
    {
      no: 'Q2',
      type: 'Multiple Choice',
      difficulty: 'Medium',
      pts: '2 pts',
      question: 'Which method is used to add an element to the end of an array?',
      successRate: 76.3,
      options: [
        { key: 'A', text: 'push()', correct: true },
        { key: 'B', text: 'pop()' },
        { key: 'C', text: 'shift()' },
        { key: 'D', text: 'unshift()' },
      ],
    },
  ];

  // ======= Settings tab =======
  timeLimit = '15 minutes';
  attemptsAllowed = '3 attempts';
  passingScore = '70%';
  questionRandomization = 'Enabled';

  showResults = 'After submission';
  showCorrectAnswers = 'After all attempts';
  lateSubmission = 'Not allowed';
  proctoring = 'Disabled';

  // ======= actions =======
  setTab(t: TabKey) {
    this.activeTab = t;
  }

  editQuiz() {
    if (this.quiz) this.edit.emit(this.quiz);
  }

  exportData() {
    const q = this.quiz;
    const rows = [
      ['Quiz Title', q?.title ?? ''],
      ['Quiz ID', q?.id ?? ''],
      ['Course', q?.course ?? ''],
      ['Instructor', q?.instructor ?? ''],
      ['Attempts', String(q?.attempts ?? 0)],
      ['Avg Score', String(q?.avg ?? 0)],
      ['Completion', String(q?.completion ?? 0)],
    ];

    const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_analytics_${(q?.id ?? 'export')}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // ======= UI helpers =======
  pillClass(d: 'Easy' | 'Medium' | 'Hard') {
    if (d === 'Easy') return 'bg-[#E8F7EE] text-[#16A34A] border-[#D1F2DF]';
    if (d === 'Medium') return 'bg-[#FFF6DF] text-[#D97706] border-[#FDE7B3]';
    return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
  }

  perfToneClass(tone: 'excellent' | 'good' | 'needs') {
    if (tone === 'excellent') return 'text-[#16A34A]';
    if (tone === 'good') return 'text-[#D97706]';
    return 'text-[#DC2626]';
  }

  metricColor(c: MetricRow['color']) {
    if (c === 'green') return 'text-[#16A34A]';
    if (c === 'orange') return 'text-[#F59E0B]';
    return 'text-[#2563EB]';
  }
}

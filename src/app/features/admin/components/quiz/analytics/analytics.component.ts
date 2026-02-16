import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

type StatTone = 'blue' | 'green' | 'purple' | 'orange';
type DeltaTone = 'positive' | 'negative' | 'neutral';

type StatCard = {
  label: string;
  value: string;
  deltaText: string;
  deltaTone: DeltaTone;
  tone: StatTone;
  icon: 'user' | 'trophy' | 'check' | 'clock';
};

type DistributionRow = {
  label: string;
  percent: number; // 0-100
  barColor: string; // hex
};

type PatternItem = {
  title: string;
  subtitle: string;
  value: string;
  valueColor: string; // hex
};

type QuestionType = 'Multiple Choice' | 'Code' | 'Essay';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

type QuestionRow = {
  title: string;
  subtitle: string;
  type: QuestionType;
  typeTone: 'blue' | 'purple' | 'green';
  correctRate: number; // 0-100
  correctBarColor: string; // hex
  avgTime: string;
  difficulty: Difficulty;
  difficultyTone: 'green' | 'amber' | 'orange';
};

type TopQuizItem = {
  title: string;
  meta: string;
  grade: string;
  gradeColor: string; // hex
  avg: string;
  bg: string; // hex
};

type ImprovementItem = {
  title: string;
  subtitle: string;
  value: string;
  valueColor: string; // hex
  unit: string;
};

@Component({
  selector: 'app-analytics',
  imports: [CommonModule,FormsModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AnalyticsComponent {
  // Header
  quizTitle = 'Unknown Quiz';
  headerSubtitle = 'Detailed performance data for this specific quiz';

  // Filters
  quizzes = ['All Quizzes', 'JavaScript Fundamentals', 'React Components', 'CSS Grid Layout'];
  dateRanges = ['Last 7 days', 'Last 30 days', 'Last 90 days'];

  selectedQuiz = this.quizzes[0];
  selectedRange = this.dateRanges[0];

  // Stats
  statCards: StatCard[] = [
    { label: 'Total Attempts', value: '3,247', deltaText: '+18.2% from last month', deltaTone: 'positive', tone: 'blue', icon: 'user' },
    { label: 'Average Score', value: '85.2%', deltaText: '+2.1% improvement', deltaTone: 'positive', tone: 'green', icon: 'trophy' },
    { label: 'Completion Rate', value: '95.2%', deltaText: '-1.3% from last month', deltaTone: 'negative', tone: 'purple', icon: 'check' },
    { label: 'Avg. Time Spent', value: '18.2m', deltaText: 'Per quiz attempt', deltaTone: 'neutral', tone: 'orange', icon: 'clock' },
  ];

  // Score Distribution
  scoreDistribution: DistributionRow[] = [
    { label: '90-100%', percent: 45, barColor: '#22C55E' },
    { label: '80-89%', percent: 32, barColor: '#2563EB' },
    { label: '70-79%', percent: 18, barColor: '#EAB308' },
    { label: '60-69%', percent: 4, barColor: '#F97316' },
    { label: 'Below 60%', percent: 1, barColor: '#EF4444' },
  ];

  // Attempt Patterns
  attemptPatterns: PatternItem[] = [
    { title: 'Peak Hours', subtitle: 'Most active time', value: '2:00 PM - 4:00 PM', valueColor: '#7C3AED' },
    { title: 'Average Attempts', subtitle: 'Per student', value: '1.8 attempts', valueColor: '#7C3AED' },
    { title: 'First Attempt Success', subtitle: 'Pass rate on first try', value: '78.2%', valueColor: '#16A34A' },
    { title: 'Retry Rate', subtitle: 'Students who retake', value: '21.8%', valueColor: '#2563EB' },
  ];

  // Question-Level Performance
  questionRows: QuestionRow[] = [
    {
      title: 'What is the difference between let and var?',
      subtitle: 'JavaScript Fundamentals - Q1',
      type: 'Multiple Choice',
      typeTone: 'blue',
      correctRate: 87,
      correctBarColor: '#22C55E',
      avgTime: '1m 23s',
      difficulty: 'Easy',
      difficultyTone: 'green',
    },
    {
      title: 'Implement a closure function',
      subtitle: 'JavaScript Fundamentals - Q2',
      type: 'Code',
      typeTone: 'purple',
      correctRate: 64,
      correctBarColor: '#EAB308',
      avgTime: '4m 17s',
      difficulty: 'Hard',
      difficultyTone: 'orange',
    },
    {
      title: 'Explain event bubbling',
      subtitle: 'JavaScript Fundamentals - Q3',
      type: 'Essay',
      typeTone: 'green',
      correctRate: 76,
      correctBarColor: '#2563EB',
      avgTime: '3m 45s',
      difficulty: 'Medium',
      difficultyTone: 'amber',
    },
  ];

  // Bottom lists
  topPerforming: TopQuizItem[] = [
    { title: 'JavaScript Fundamentals', meta: '247 attempts • 95.2% completion', grade: 'A+', gradeColor: '#16A34A', avg: '85.2 avg', bg: '#ECFDF5' },
    { title: 'React Components', meta: '189 attempts • 91.8% completion', grade: 'A', gradeColor: '#2563EB', avg: '82.1 avg', bg: '#EFF6FF' },
    { title: 'CSS Grid Layout', meta: '156 attempts • 87.3% completion', grade: 'B+', gradeColor: '#A855F7', avg: '78.9 avg', bg: '#FAF5FF' },
  ];

  improvements: ImprovementItem[] = [
    { title: 'Advanced Algorithms', subtitle: 'Low completion rate', value: '58%', valueColor: '#DC2626', unit: 'completion' },
    { title: 'Database Optimization', subtitle: 'High retry rate', value: '3.2', valueColor: '#F97316', unit: 'avg attempts' },
    { title: 'System Design', subtitle: 'Long completion time', value: '45m', valueColor: '#F59E0B', unit: 'avg time' },
  ];

  // UI Actions
  viewAllQuizzes() {
    // hook your routing/modal here
  }

  exportReport() {
    // call your export API here
  }

  viewQuestion(row: QuestionRow) {
    // open detail view here
    console.log('View question:', row.title);
  }

  // Helpers for badge styles
  typeBadgeClass(tone: QuestionRow['typeTone']) {
    if (tone === 'blue') return 'bg-[#E6F0FF] text-[#2563EB]';
    if (tone === 'purple') return 'bg-[#F3E8FF] text-[#7C3AED]';
    return 'bg-[#DCFCE7] text-[#16A34A]';
  }

  difficultyBadgeClass(tone: QuestionRow['difficultyTone']) {
    if (tone === 'green') return 'bg-[#DCFCE7] text-[#16A34A]';
    if (tone === 'amber') return 'bg-[#FEF9C3] text-[#A16207]';
    return 'bg-[#FFEDD5] text-[#F97316]';
  }

  statIconBg(tone: StatTone) {
    if (tone === 'blue') return 'bg-[#E6F0FF]';
    if (tone === 'green') return 'bg-[#DCFCE7]';
    if (tone === 'purple') return 'bg-[#F3E8FF]';
    return 'bg-[#FFEDD5]';
  }

  statIconColor(tone: StatTone) {
    if (tone === 'blue') return 'text-[#2563EB]';
    if (tone === 'green') return 'text-[#16A34A]';
    if (tone === 'purple') return 'text-[#A855F7]';
    return 'text-[#F97316]';
  }

  deltaTextClass(tone: DeltaTone) {
    if (tone === 'positive') return 'text-[#16A34A]';
    if (tone === 'negative') return 'text-[#DC2626]';
    return 'text-[#6B7280]';
  }
}

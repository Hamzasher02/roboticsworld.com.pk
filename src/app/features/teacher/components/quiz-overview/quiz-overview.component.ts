import { CommonModule, NgClass } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { QuizApiService } from '../../../../core/services/teacher/quiz/quiz-api.service';
import { InstructorCoursesService } from '../../../../core/services/teacher/courses/courses.service';
import { QuizQuestion as ApiQuizQuestion } from '../../../../core/interfaces/teacher/quiz/quiz-api';
import { ApiCourseModule } from '../../../../core/interfaces/teacher/courses/courses';

type TabKey = 'overview' | 'students' | 'questions' | 'analytics';

type TabItem = {
  key: TabKey;
  label: string;
  active: boolean;
  icon: string;
  activeIcon: string;
};

type StatCard = {
  label: string;
  value: string;
  bg: string;
  text: string;
  valueColor: string;
  icon: string;
};

type InfoRow = {
  label: string;
  value: string;
};

type PerformanceRow = {
  label: string;
  value: string;
  width: string;
  color: string;
};

type StudentAttemptStatus = 'completed' | 'in progress' | 'not started';

type StudentAttemptRow = {
  name: string;
  email: string;
  avatar: string;
  status: StudentAttemptStatus;
  score: string | null;
  timeSpent: string | null;
  attemptDate: string | null;
};

type QuizOption = {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  correct?: boolean;
};

type QuizQuestion = {
  title: string;
  points: number;
  prompt: string;
  options: QuizOption[];
};

@Component({
  selector: 'app-quiz-overview',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './quiz-overview.component.html',
})
export class QuizOverviewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly quizApi = inject(QuizApiService);
  private readonly coursesService = inject(InstructorCoursesService);

  quizId!: string;
  activeTabKey: TabKey = 'overview';

  isLoadingQuiz = false;
  modulesList: ApiCourseModule[] = [];

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.quizId = this.route.snapshot.paramMap.get('id')!;
    if (this.quizId) this.fetchQuiz(); // ✅ API call here
  }

  // ------------------------------------
  // UI (same as your design)
  // ------------------------------------
  header = {
    title: 'Data Science Fundamentals',
    subtitle: 'Course: Data Science • Module: Statistics and Probability',
    backIcon: '/assets/instructor-images/quiz/4.svg',
  };

  tabs: TabItem[] = [
    {
      key: 'overview',
      label: 'Overview',
      active: true,
      icon: '/assets/instructor-images/quiz/Group (3).svg',
      activeIcon: '/assets/instructor-images/quiz/Group (3).svg',
    },
    {
      key: 'students',
      label: 'Students (5)',
      active: false,
      icon: '/assets/instructor-images/quiz/6.svg',
      activeIcon: '/assets/instructor-images/quiz/6.svg',
    },
    {
      key: 'questions',
      label: 'Questions (3)',
      active: false,
      icon: '/assets/instructor-images/quiz/7.svg',
      activeIcon: '/assets/instructor-images/quiz/7.svg',
    },
    {
      key: 'analytics',
      label: 'Analytics',
      active: false,
      icon: '/assets/instructor-images/quiz/3.svg',
      activeIcon: '/assets/instructor-images/quiz/3.svg',
    },
  ];

  // ✅ Overview stats: API only gives questions/points/settings (students/avg score/time API me nahi)
  // So: we update ONLY what we can safely compute
  stats: StatCard[] = [
    {
      label: 'Total Students',
      value: '5',
      bg: 'bg-[#EAF2FF]',
      text: 'text-[#2563EB]',
      valueColor: 'text-[#1E3A8A]',
      icon: '/assets/instructor-images/quiz/DIV-476.svg',
    },
    {
      label: 'Completed',
      value: '3',
      bg: 'bg-[#E9FBEE]',
      text: 'text-[#16A34A]',
      valueColor: 'text-[#166534]',
      icon: '/assets/instructor-images/quiz/DIV-488.svg',
    },
    {
      label: 'Average Score',
      value: '85%',
      bg: 'bg-[#F4ECFF]',
      text: 'text-[#7C3AED]',
      valueColor: 'text-[#5B21B6]',
      icon: '/assets/instructor-images/quiz/DIV-500.svg',
    },
    {
      label: 'Avg Time',
      value: '38m',
      bg: 'bg-[#FFF3E8]',
      text: 'text-[#EA580C]',
      valueColor: 'text-[#9A3412]',
      icon: '/assets/instructor-images/quiz/DIV-512.svg',
    },
  ];

  quizInfo: InfoRow[] = [
    { label: 'Course Name', value: 'Data Science' },
    { label: 'Module', value: 'Statistics and Probability' },
    { label: 'Questions', value: '12' },
    { label: 'Time Limit', value: '30 minutes' },
    { label: 'Total Points', value: '30' },
    { label: 'Created', value: '1/22/2024' },
  ];

  performance: PerformanceRow[] = [
    { label: 'Completion Rate', value: '60%', width: '60%', color: 'bg-[#22C55E]' },
    { label: 'High Performers (90%+)', value: '1', width: '20%', color: 'bg-[#3B82F6]' },
    { label: 'Need Support (<70%)', value: '0', width: '0%', color: 'bg-[#9CA3AF]' },
  ];

  actionIcons = {
    view: '/assets/instructor-images/quiz/10.svg',
    mail: '/assets/instructor-images/quiz/9.svg',
    profile: '/assets/instructor-images/quiz/8.svg',
  };

  // ✅ Students tab: same as your static (NO API)
  studentAttempts: StudentAttemptRow[] = [
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      avatar: '/assets/instructor-images/quiz/IMG-497.svg',
      status: 'completed',
      score: '92%',
      timeSpent: '38m',
      attemptDate: '1/15/2024',
    },
    {
      name: 'Bob Smith',
      email: 'bob.smith@email.com',
      avatar: '/assets/instructor-images/quiz/IMG-563.svg',
      status: 'completed',
      score: '78%',
      timeSpent: '42m',
      attemptDate: '1/15/2024',
    },
    {
      name: 'Carol Davis',
      email: 'carol.davis@email.com',
      avatar: '/assets/instructor-images/quiz/IMG-563.svg',
      status: 'completed',
      score: '85%',
      timeSpent: '35m',
      attemptDate: '1/16/2024',
    },
    {
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      avatar: '/assets/instructor-images/quiz/IMG-563.svg',
      status: 'in progress',
      score: null,
      timeSpent: null,
      attemptDate: '1/16/2024',
    },
    {
      name: 'Emma Brown',
      email: 'emma.brown@email.com',
      avatar: '/assets/instructor-images/quiz/IMG-563.svg',
      status: 'not started',
      score: null,
      timeSpent: null,
      attemptDate: null,
    },
  ];

  questionIcons = {
    check: '/assets/instructor-images/quiz/tick.svg',
  };

  // ✅ Questions tab: WILL be replaced from API
  questionsList: QuizQuestion[] = [
    {
      title: 'Question 1',
      points: 10,
      prompt: 'What is the primary programming language for web development?',
      options: [
        { key: 'A', text: 'JavaScript', correct: true },
        { key: 'B', text: 'Python' },
        { key: 'C', text: 'Java' },
        { key: 'D', text: 'C++' },
      ],
    },
  ];

  // ✅ Analytics tab: same as your static (NO API)
  scoreDistribution = [
    { label: '90-100%', count: 3, width: '60%', color: 'bg-[#22C55E]' },
    { label: '80-89%', count: 2, width: '40%', color: 'bg-[#3B82F6]' },
    { label: '70-79%', count: 1, width: '20%', color: 'bg-[#F59E0B]' },
    { label: 'Below 70%', count: 0, width: '0%', color: 'bg-[#9CA3AF]' },
  ];

  questionAnalysis = [
    { label: 'Q1', text: '67% correct', width: '67%' },
    { label: 'Q2', text: '67% correct', width: '67%' },
    { label: 'Q3', text: '67% correct', width: '67%' },
  ];

  // ------------------------------------
  // ✅ API integration: getQuiz/:quizId
  // ------------------------------------
  private fetchQuiz(): void {
    this.isLoadingQuiz = true;

    this.quizApi
      .getQuiz(this.quizId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoadingQuiz = false))
      )
      .subscribe({
        next: (res) => {
          const data: any = res?.data;
          if (!data) return;

          // Header from API
          const courseTitle = data?.course?.courseTitle ?? '—';
          const courseId = data?.course?._id;
          const moduleId = data?.module?._id ?? '—';

          // Fetch modules to get module name
          if (courseId) {
            this.coursesService
              .getCourseModulesUserSide(courseId)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (modulesRes) => {
                  this.modulesList = modulesRes?.data ?? [];
                  const foundModule = this.modulesList.find((m) => m._id === moduleId);
                  const moduleName = foundModule?.moduleName ?? moduleId;

                  // Update header with module name
                  this.header = {
                    ...this.header,
                    title: data?.title ?? '',
                    subtitle: `Course: ${courseTitle} • Module: ${moduleName}`,
                  };

                  // Update quizInfo with module name
                  this.quizInfo = this.quizInfo.map((info) =>
                    info.label === 'Module' ? { ...info, value: moduleName } : info
                  );
                },
                error: (err) => {
                  console.error('getCourseModulesUserSide API error:', err);
                },
              });
          }

          // Set initial values (will be updated when modules are fetched)
          this.header = {
            ...this.header,
            title: data?.title ?? '',
            subtitle: `Course: ${courseTitle} • Module: ${moduleId}`,
          };

          // Quiz Info from API
          const totalQuestions = data?.totalQuestions ?? (data?.questions?.length ?? 0);
          const totalPoints = data?.totalPoints ?? this.sumPoints(data?.questions ?? []);
          const timeLimit = data?.settings?.timeLimitMinutes ?? 0;
          const createdAt = data?.createdAt ? this.formatDate(data.createdAt) : '—';

          this.quizInfo = [
            { label: 'Course Name', value: courseTitle },
            { label: 'Module', value: moduleId },
            { label: 'Questions', value: String(totalQuestions) },
            { label: 'Time Limit', value: `${timeLimit} minutes` },
            { label: 'Total Points', value: String(totalPoints) },
            { label: 'Created', value: createdAt },
          ];

          // Tabs: update Questions count (Students count same static)
          this.tabs = this.tabs.map((t) => {
            if (t.key === 'questions') {
              return { ...t, label: `Questions (${totalQuestions})` };
            }
            return t;
          });

          // Questions List from API
          this.questionsList = (data?.questions ?? []).map((q: ApiQuizQuestion, idx: number) => ({
            title: `Question ${idx + 1}`,
            points: q?.points ?? 0,
            prompt: q?.prompt ?? '',
            options: (q?.options ?? [])
              .filter((o: any) => !!o?.label) // safety
              .map((o: any) => ({
                key: (o.label as 'A' | 'B' | 'C' | 'D') ?? 'A',
                text: o?.text ?? '',
                correct: !!o?.isCorrect,
              })),
          }));

          // Optional: if no questions, keep UI stable
          if (!this.questionsList.length) {
            this.questionsList = [];
          }

          // Stats: we can update ONLY safe parts if you want (optional)
          // Example: average score / students are not provided by API -> keep as static
        },
        error: (err) => {
          console.error('getQuiz API error:', err);
        },
      });
  }

  private sumPoints(questions: ApiQuizQuestion[]): number {
    return (questions ?? []).reduce((acc, q: any) => acc + (Number(q?.points) || 0), 0);
  }

  private formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
  }

  // ------------------------------------
  // Your existing methods (same)
  // ------------------------------------
  setActiveTab(index: number): void {
    this.tabs = this.tabs.map((t, i) => ({ ...t, active: i === index }));
    this.activeTabKey = this.tabs[index].key;
  }

  statusPillClass(status: StudentAttemptStatus): string {
    switch (status) {
      case 'completed':
        return 'bg-[#DCFCE7] text-[#166534]';
      case 'in progress':
        return 'bg-[#FEF3C7] text-[#92400E]';
      case 'not started':
        return 'bg-[#F3F4F6] text-[#111827]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  scoreColorClass(score: string | null): string {
    if (!score) return 'text-gray-400 font-medium';
    if (score === '92%') return 'text-[#16A34A]';
    if (score === '78%') return 'text-[#F59E0B]';
    if (score === '85%') return 'text-[#2563EB]';
    return 'text-gray-700';
  }

  optionRowClass(opt: QuizOption): string {
    return opt.correct ? 'border-[#BBF7D0] bg-[#ECFDF5]' : 'border-gray-200 bg-[#F9FAFB]';
  }

  optionTextClass(opt: QuizOption): string {
    return opt.correct ? 'text-[#166534]' : 'text-gray-700';
  }

  goBack(): void {
    window.history.back();
  }

  viewStudentQuiz(attempt: StudentAttemptRow): void {
    this.router.navigate(['/instructor/instructor-quiz/view-student-quiz'], {
      state: { attempt },
    });
  }

  StudentProfile(attempt: StudentAttemptRow): void {
    this.router.navigate(['/instructor/profile/student-profile'], {
      state: { attempt },
    });
  }
}

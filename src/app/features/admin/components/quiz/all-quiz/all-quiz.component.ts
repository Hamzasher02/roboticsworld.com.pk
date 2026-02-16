// all-quiz.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { QuizReveiwComponent } from "../quiz-reveiw/quiz-reveiw.component";
import { AppQuizAnalyticsComponent } from "../app-quiz-analytics/app-quiz-analytics.component";

type QuizStatus = 'Published' | 'Under Review' | 'Draft';

type Quiz = {
  title: string;
  id: string;
  instructor: string;
  course: string;
  date: string;
  status: QuizStatus;
  attempts: number;
  avg: number;
  completion: number;
  instructorAvatar: string;
};

@Component({
  selector: 'app-all-quiz',
  standalone: true,
  imports: [CommonModule, QuizReveiwComponent, AppQuizAnalyticsComponent],
  templateUrl: './all-quiz.component.html',
  styleUrl: './all-quiz.component.css',
})
export class AllQuizComponent {

  // ✅ modal state
  showReview = false;
  selectedQuiz: Quiz | null = null;
  // ✅ Stats modal
  showStats = false;
  selectedStatsQuiz: Quiz | null = null;

  // view
  viewMode: 'list' | 'grid' = 'list';

  // filters
  searchText = '';
  statusFilter: 'All' | QuizStatus = 'All';
  instructorFilter: 'All' | string = 'All';
  courseFilter: 'All' | string = 'All';

  // pagination
  pageSize = 6;
  currentPage = 1;

  // data
  quizzes: Quiz[] = [
    {
      title: 'JavaScript Fundamentals Assessment',
      id: 'QZ-001',
      instructor: 'Emily Johnson',
      course: 'Advanced JavaScript',
      date: '2025-04-28',
      status: 'Published',
      attempts: 247,
      avg: 85.2,
      completion: 94.5,
      instructorAvatar: 'https://i.pravatar.cc/80?img=47',
    },
    {
      title: 'React Components Deep Dive',
      id: 'QZ-002',
      instructor: 'Michael Chen',
      course: 'React Development',
      date: '2025-04-30',
      status: 'Under Review',
      attempts: 0,
      avg: 0,
      completion: 0,
      instructorAvatar: 'https://i.pravatar.cc/80?img=12',
    },
    {
      title: 'JavaScript Fundamentals Assessment',
      id: 'QZ-001',
      instructor: 'Emily Johnson',
      course: 'Advanced JavaScript',
      date: '2025-04-28',
      status: 'Published',
      attempts: 247,
      avg: 85.2,
      completion: 94.5,
      instructorAvatar: 'https://i.pravatar.cc/80?img=47',
    },
    {
      title: 'React Components Deep Dive',
      id: 'QZ-002',
      instructor: 'Michael Chen',
      course: 'React Development',
      date: '2025-04-30',
      status: 'Under Review',
      attempts: 0,
      avg: 0,
      completion: 0,
      instructorAvatar: 'https://i.pravatar.cc/80?img=12',
    },
    {
      title: 'JavaScript Fundamentals Assessment',
      id: 'QZ-001',
      instructor: 'Emily Johnson',
      course: 'Advanced JavaScript',
      date: '2025-04-28',
      status: 'Published',
      attempts: 247,
      avg: 85.2,
      completion: 94.5,
      instructorAvatar: 'https://i.pravatar.cc/80?img=47',
    },
    {
      title: 'React Components Deep Dive',
      id: 'QZ-002',
      instructor: 'Michael Chen',
      course: 'React Development',
      date: '2025-04-30',
      status: 'Under Review',
      attempts: 0,
      avg: 0,
      completion: 0,
      instructorAvatar: 'https://i.pravatar.cc/80?img=12',
    },
    // ... baqi same
  ];

  // dropdown options
  get instructors(): string[] {
    const set = new Set(this.quizzes.map((q) => q.instructor));
    return Array.from(set);
  }

  get courses(): string[] {
    const set = new Set(this.quizzes.map((q) => q.course));
    return Array.from(set);
  }

  // ===== view actions =====
  setView(mode: 'list' | 'grid') {
    this.viewMode = mode;
    this.clampPage();
  }

  refresh() {
    this.clampPage();
  }

  // ===== filters =====
  onSearch(val: string) {
    this.searchText = val;
    this.currentPage = 1;
  }

  onStatusChange(val: string) {
    this.statusFilter = (val === 'All' ? 'All' : (val as QuizStatus)) as any;
    this.currentPage = 1;
  }

  onInstructorChange(val: string) {
    this.instructorFilter = val === 'All' ? 'All' : val;
    this.currentPage = 1;
  }

  onCourseChange(val: string) {
    this.courseFilter = val === 'All' ? 'All' : val;
    this.currentPage = 1;
  }

  // ===== computed lists =====
  get filteredQuizzes(): Quiz[] {
    const s = this.searchText.trim().toLowerCase();

    return this.quizzes.filter((q) => {
      const matchesSearch =
        !s ||
        q.title.toLowerCase().includes(s) ||
        q.id.toLowerCase().includes(s) ||
        q.instructor.toLowerCase().includes(s) ||
        q.course.toLowerCase().includes(s);

      const matchesStatus = this.statusFilter === 'All' ? true : q.status === this.statusFilter;
      const matchesInstructor = this.instructorFilter === 'All' ? true : q.instructor === this.instructorFilter;
      const matchesCourse = this.courseFilter === 'All' ? true : q.course === this.courseFilter;

      return matchesSearch && matchesStatus && matchesInstructor && matchesCourse;
    });
  }

  get totalPages(): number {
    const total = this.filteredQuizzes.length;
    const pages = Math.ceil(total / this.pageSize);
    return Math.max(1, pages);
  }

  get pagedQuizzes(): Quiz[] {
    this.clampPage();
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredQuizzes.slice(start, start + this.pageSize);
  }

  get pageStart(): number {
    if (this.filteredQuizzes.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    if (this.filteredQuizzes.length === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, this.filteredQuizzes.length);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const cur = this.currentPage;

    const maxButtons = 5;
    let start = Math.max(1, cur - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > total) {
      end = total;
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // ===== pagination actions =====
  changePageSize(size: number) {
    this.pageSize = Math.max(1, Number(size || 6));
    this.currentPage = 1;
    this.clampPage();
  }

  goToPage(page: number) {
    const p = Number(page || 1);
    this.currentPage = Math.min(this.totalPages, Math.max(1, p));
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  private clampPage() {
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    if (this.currentPage < 1) this.currentPage = 1;
  }

  // ===== UI helpers =====
  pillClasses(status: QuizStatus) {
    if (status === 'Published') return 'bg-[#E8F7EE] text-[#16A34A] border border-[#D1F2DF]';
    if (status === 'Under Review') return 'bg-[#FFF6DF] text-[#D97706] border border-[#FDE7B3]';
    return 'bg-[#F3F4F6] text-[#111827] border border-[#E5E7EB]';
  }

  // ✅ View action -> open modal
  viewQuiz(q: Quiz) {
    this.selectedQuiz = q;
    this.showReview = true;
  }

  // ✅ Close modal
  closeReview() {
    this.showReview = false;
    this.selectedQuiz = null;
  }

  openStats(q: Quiz) {
    this.selectedStatsQuiz = q;
    this.showStats = true;
  }
  closeStats() {
    this.showStats = false;
    this.selectedStatsQuiz = null;
  }

  // ✅ Delete confirm modal
showDeleteConfirm = false;
quizToDelete: Quiz | null = null;

// Open delete modal
openDeleteConfirm(q: Quiz) {
  this.quizToDelete = q;
  this.showDeleteConfirm = true;
}

// Close delete modal
closeDeleteConfirm() {
  this.showDeleteConfirm = false;
  this.quizToDelete = null;
}

// Confirm delete
confirmDelete() {
  if (!this.quizToDelete) return;

  this.quizzes = this.quizzes.filter(
    (x) => x.id !== this.quizToDelete!.id
  );

  this.closeDeleteConfirm();
  this.clampPage();
}


  exportCsv() {
    const rows = this.filteredQuizzes;
    const headers = ['Title', 'ID', 'Instructor', 'Course', 'Date', 'Status', 'Attempts', 'Avg', 'Completion'];
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        [r.title, r.id, r.instructor, r.course, r.date, r.status, r.attempts, r.avg, r.completion]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `quizzes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }
}

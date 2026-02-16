import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  CoursesSessionDetailComponent,
  SessionDetail
} from '../courses-session-detail/courses-session-detail.component';

import { InstructorCoursesService } from '../../../../core/services/teacher/courses/courses.service';
import {
  ApiAssignedCourse,
  ApiCourseModule,
  ApiStudentProgressItem
} from '../../../../core/interfaces/teacher/courses/courses';

type CourseModule = {
  no: number;
  title: string;
  status: 'Complete' | 'Incomplete';
};

type UpcomingSession = {
  student: string;
  sessionType: 'Demo Session' | 'Regular Class';
  status: 'Confirmed' | 'Scheduled';
  courseTitle: string;
  courseSubtitle: string;
  date: string;
  time: string;
  meetingLink?: string;
};

type StudentRow = {
  id: string;
  name: string;
  sessionProgress: string;
};

@Component({
  selector: 'app-courses-detail',
  standalone: true,
  imports: [CommonModule, CoursesSessionDetailComponent],
  templateUrl: './courses-detail.component.html',
  styleUrl: './courses-detail.component.css'
})
export class CoursesDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private instructorCoursesService: InstructorCoursesService
  ) { }

  isLoadingCourse = false;
  isLoadingModules = false;
  isLoadingStudents = false;

  breadcrumb = { left: 'My Courses', current: '' };

  course = {
    title: '',
    subtitle: '',
    updated: '—',
    uploaded: '—',
    createdBy: '—',
    rating: 4.8,
    reviews: '0',
    duration: '—',
    students: 0,
    sessions: 0,
    level: '—',
    imageUrl: '/assets/instructor-images/courses/Course Thumbnail.svg',
    outlineUrl: '' as string | ''
  };

  modules: CourseModule[] = [];
  students: StudentRow[] = [];

  // (still static - jab sessions api mile to replace)
  upcomingSessions: UpcomingSession[] = [
    {
      student: 'Bisma',
      sessionType: 'Demo Session',
      status: 'Confirmed',
      courseTitle: '2021 Complete Python....',
      courseSubtitle: 'Python for Beginners - Beginner',
      date: '1/15/2025',
      time: '10:00 AM - 11:00 AM',
      meetingLink: 'https://zoom.us/j/123456789'
    }
  ];

  isSessionDetailOpen = false;
  selectedSessionDetail: SessionDetail | null = null;

  private currentCourseId = '';

  ngOnInit(): void {
    // ✅ IMPORTANT: route changes ko listen karo (same component reuse hota hai)
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id') || params.get('courseId'); // ✅ supports both
        if (!id) {
          console.error('Course id missing in route params');
          this.goBack();
          return;
        }

        if (this.currentCourseId === id) return;
        this.currentCourseId = id;

        this.resetUi();
        this.fetchCourseById(id);
        this.fetchCourseModules(id);
        this.fetchCourseStudents(id);
      });
  }

  private resetUi(): void {
    this.breadcrumb = { left: 'My Courses', current: '' };
    this.modules = [];
    this.students = [];

    this.course = {
      ...this.course,
      title: '',
      subtitle: '',
      uploaded: '—',
      updated: '—',
      createdBy: '—',
      duration: '—',
      students: 0,
      sessions: 0,
      level: '—',
      outlineUrl: '',
      imageUrl: '/assets/instructor-images/courses/Course Thumbnail.svg'
    };
  }

  // -------------------------
  // ✅ API 1: Course Detail
  // -------------------------
  private fetchCourseById(courseId: string): void {
    this.isLoadingCourse = true;

    this.instructorCoursesService
      .getCourseById(courseId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoadingCourse = false))
      )
      .subscribe({
        next: (res) => {
          const c = res?.data;
          if (!c?._id) return;
          this.applyCourseToUi(c);
        },
        error: (err) => {
          console.error('getCourseById API error:', err);
        }
      });
  }

  private applyCourseToUi(c: ApiAssignedCourse): void {
    const creatorName = `${c?.createdBy?.firstName ?? ''} ${c?.createdBy?.lastName ?? ''}`.trim();
    const role = (c?.createdBy?.role ?? '').trim();

    // screenshot me "ADMIN" jaisa show hota hai — role prefer karo
    const createdByText =
      role ? role.toUpperCase() : (creatorName || '—');

    this.breadcrumb = {
      left: 'My Courses',
      current: c.courseTitle ?? ''
    };

    this.course = {
      ...this.course,
      title: c.courseTitle ?? '',
      subtitle: c.courseSubCategory ?? '',
      uploaded: this.formatDateLong(c.createdAt),
      updated: this.formatDateLong(c.updatedAt),
      createdBy: createdByText,
      level: c.courseLevel ?? '—',
      imageUrl: c.courseThumbnail?.secureUrl || this.course.imageUrl,
      outlineUrl: c.courseOutline?.secureUrl || ''
    };
  }

  // -------------------------
  // ✅ API 2: Modules
  // -------------------------
  private fetchCourseModules(courseId: string): void {
    this.isLoadingModules = true;

    this.instructorCoursesService
      .getCourseModulesUserSide(courseId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoadingModules = false))
      )
      .subscribe({
        next: (res) => {
          const list = res?.data ?? [];

          // UI modules
          this.modules = list
            .slice()
            .sort((a, b) => (a.moduleIndex ?? 0) - (b.moduleIndex ?? 0))
            .map((m) => this.mapApiModuleToUi(m));

          // sessions: sum(noOfSession) else fallback modules length
          const sessionsFromNo = list.reduce((sum, m) => sum + (m.noOfSession ?? 0), 0);
          const sessions = sessionsFromNo > 0 ? sessionsFromNo : list.length;

          // duration: best effort using sessionDuration
          const totalMinutes = list.reduce((sum, m) => {
            const one = (m.sessionDuration ?? 0);
            const count = (m.noOfSession ?? 1); // if null, assume 1
            return sum + (one * count);
          }, 0);

          this.course = {
            ...this.course,
            sessions,
            duration: this.formatDuration(totalMinutes) // "3 Weeks" etc.
          };
        },
        error: (err) => {
          console.error('getCourseModulesUserSide API error:', err);
          this.modules = [];
          this.course = { ...this.course, sessions: 0, duration: '—' };
        }
      });
  }

  private mapApiModuleToUi(m: ApiCourseModule): CourseModule {
    return {
      no: m.moduleIndex ?? 0,
      title: m.moduleName ?? '',
      status: m.completed ? 'Complete' : 'Incomplete'
    };
  }

  // -------------------------
  // ✅ API 3: Students
  // -------------------------
  private fetchCourseStudents(courseId: string): void {
    this.isLoadingStudents = true;

    this.instructorCoursesService
      .getCourseStudentsProgress(courseId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoadingStudents = false))
      )
      .subscribe({
        next: (res) => {
          const list = res?.data ?? [];

          this.students = list.map((s) => this.mapApiStudentToUi(s));

          this.course = {
            ...this.course,
            students: this.students.length
          };
        },
        error: (err) => {
          console.error('getCourseStudentsProgress API error:', err);
          this.students = [];
          this.course = { ...this.course, students: 0 };
        }
      });
  }

  private mapApiStudentToUi(s: ApiStudentProgressItem): StudentRow {
    const name = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
    const total = Number.isFinite(s.totalModules) ? s.totalModules : 0;
    const done = Number.isFinite(s.modulesMarkedComplete) ? s.modulesMarkedComplete : 0;

    return {
      id: s._id,
      name,
      sessionProgress: `Session: ${done}/${total}`
    };
  }

  // -------------------------
  // UI / Helpers
  // -------------------------
  onCourseImageError(): void {
    this.course = {
      ...this.course,
      imageUrl: '/assets/instructor-images/courses/Course Thumbnail.svg'
    };
  }

  private formatDateLong(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private formatDuration(totalMinutes: number): string {
    if (!totalMinutes || totalMinutes <= 0) return '—';

    // simple conversion: 60m=1h, 6h/day, 5days/week (approx course style)
    const hours = totalMinutes / 60;
    const days = hours / 6;
    const weeks = days / 5;

    if (weeks >= 1) return `${Math.round(weeks)} Weeks`;
    if (days >= 1) return `${Math.round(days)} Days`;
    return `${Math.round(hours)} Hours`;
  }

  goBack() {
    history.back();
  }

  viewSessionDetails(s: UpcomingSession) {
    this.selectedSessionDetail = this.mapToSessionDetail(s);
    this.isSessionDetailOpen = true;
  }

  closeSessionDetail() {
    this.isSessionDetailOpen = false;
    this.selectedSessionDetail = null;
  }

  joinFromModal() {
    const link = this.selectedSessionDetail?.meetingLink;
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  }

  joinMeeting(s: UpcomingSession) {
    if (s.meetingLink) window.open(s.meetingLink, '_blank', 'noopener,noreferrer');
  }

  private mapToSessionDetail(s: UpcomingSession): SessionDetail {
    return {
      sessionId: 'DEMO-001',
      type: s.sessionType,
      course: this.course.title || '—',
      level: this.course.level || '—',
      date: s.date,
      time: s.time,
      student: {
        name: s.student,
        email: 'student@email.com',
        grade: '—',
        age: '—',
        learningPreferences: '—'
      },
      meetingLink: s.meetingLink
    };
  }

  viewStudentDetails(st: StudentRow) {
    this.router.navigate(['/instructor/profile/student-report', st.id]);
  }
}

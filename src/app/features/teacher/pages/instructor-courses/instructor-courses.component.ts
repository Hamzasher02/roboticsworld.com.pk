import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesSessionDetailComponent, SessionDetail } from '../../components/courses-session-detail/courses-session-detail.component';
import { Router } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InstructorCoursesService } from '../../../../core/services/teacher/courses/courses.service';
import { ApiAssignedCourse } from '../../../../core/interfaces/teacher/courses/courses';

type CourseCard = {
  id: string;
  title: string;
  category: string;
  rating: number;     // ❌ backend me nahi
  reviews: string;    // ❌ backend me nahi
  duration: string;   // ✅ modules API se (estimate)
  level: string;
  thumbnailUrl?: string;

  // ✅ NEW: students count per course
  studentsCount: number;
};

type UpcomingSession = {
  name: string;
  type: string;
  status: string;
  date: string;
  time: string;
  meetingLink?: string;
};

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [CommonModule, CoursesSessionDetailComponent],
  templateUrl: './instructor-courses.component.html',
  styleUrls: ['./instructor-courses.component.css']
})
export class InstructorCoursesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private instructorCoursesService: InstructorCoursesService
  ) { }

  courses: CourseCard[] = [];

  // pagination state
  page = 1;
  limit = 10;
  totalPages = 1;
  totalCourses = 0;

  stats = [
    { label: 'In-Process', value: 0, image: '/assets/instructor-images/courses/PlayCircle.svg', bg: 'bg-orange-50' },
    { label: 'Total Courses', value: 0, image: '/assets/instructor-images/courses/Notepad.svg', bg: 'bg-green-50' },
    { label: 'Students', value: 0, image: '/assets/instructor-images/courses/UserCircle.svg', bg: 'bg-red-50' },
    { label: 'Completed Courses', value: 0, image: '/assets/instructor-images/courses/Trophy.svg', bg: 'bg-green-100' },
  ];

  isLoadingCourses = false;

  sessions: UpcomingSession[] = [
    { name: 'Bisma', type: 'Demo Session', status: 'Confirmed', date: '1/15/2025', time: '10:00 AM - 11:00 AM', meetingLink: 'https://zoom.us/j/123456789' },
    { name: 'Sarah Johnson', type: 'Regular Class', status: 'Scheduled', date: '1/15/2025', time: '10:00 AM - 11:00 AM', meetingLink: 'https://zoom.us/j/123456789' },
  ];

  isSessionDetailOpen = false;
  selectedSessionDetail: SessionDetail | null = null;

  ngOnInit(): void {
    this.fetchAssignedCourses();
  }

  fetchAssignedCourses(page = this.page): void {
    this.isLoadingCourses = true;
    this.page = page;

    this.instructorCoursesService.getMyAssignedCourses(this.page, this.limit)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoadingCourses = false))
      )
      .subscribe({
        next: (res) => {
          const list = res?.data ?? [];

          // save pagination meta (backend already sends)
          this.totalPages = res?.pagination?.totalPages ?? 1;
          this.totalCourses = res?.pagination?.totalCourses ?? list.length;

          // map basic cards
          this.courses = list.map((c) => this.mapApiCourseToCard(c));

          // update stats (base)
          this.applyStats(list);

          // ✅ enrich each course with students + duration (parallel)
          this.enrichCoursesStudentsAndDuration();
        },
        error: (err) => {
          console.error('getMyAssignedCourses API error:', err);
          this.courses = [];
          this.applyStats([]);
          this.totalPages = 1;
          this.totalCourses = 0;
        }
      });
  }

  private mapApiCourseToCard(c: ApiAssignedCourse): CourseCard {
    return {
      id: c._id,
      title: c.courseTitle ?? '',
      category: (c.courseCategory?.[0] ?? 'TECH'),
      rating: 5.0,            // ❌ backend me nahi
      reviews: '0',           // ❌ backend me nahi
      duration: '—',          // ✅ modules API se update hoga
      level: c.courseLevel ?? 'Beginner',
      thumbnailUrl: c.courseThumbnail?.secureUrl,
      studentsCount: 0        // ✅ students API se update hoga
    };
  }

  private applyStats(list: ApiAssignedCourse[]): void {
    const total = list.length;
    const completed = list.filter(x => x.isCoursePublished === true).length;
    const inProcess = list.filter(x => x.isCoursePublished === false).length;

    // Students total: ab hum per-course students nikal ke sum karenge (enrich me)
    const students = 0;

    this.stats = [
      { label: 'In-Process', value: inProcess, image: '/assets/instructor-images/courses/PlayCircle.svg', bg: 'bg-orange-50' },
      { label: 'Total Courses', value: total, image: '/assets/instructor-images/courses/Notepad.svg', bg: 'bg-green-50' },
      { label: 'Students', value: students, image: '/assets/instructor-images/courses/UserCircle.svg', bg: 'bg-red-50' },
      { label: 'Completed Courses', value: completed, image: '/assets/instructor-images/courses/Trophy.svg', bg: 'bg-green-100' },
    ];
  }

  private enrichCoursesStudentsAndDuration(): void {
    if (!this.courses.length) return;

    const jobs = this.courses.map((c) => {
      const students$ = this.instructorCoursesService.getCourseStudentsProgress(c.id).pipe(
        map((r) => (r?.data ?? []).length),
        catchError(() => of(0))
      );

      const duration$ = this.instructorCoursesService.getCourseModulesUserSide(c.id).pipe(
        map((r) => {
          const modules = r?.data ?? [];
          const totalMinutes = modules.reduce((sum, m) => {
            const one = (m.sessionDuration ?? 0);
            const count = (m.noOfSession ?? 1);
            return sum + (one * count);
          }, 0);
          return this.formatDuration(totalMinutes);
        }),
        catchError(() => of('—'))
      );

      return forkJoin({ studentsCount: students$, duration: duration$ }).pipe(
        map((extra) => ({ id: c.id, ...extra }))
      );
    });

    forkJoin(jobs)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((extras) => {
        const mapExtra = new Map(extras.map(x => [x.id, x]));

        // update courses
        this.courses = this.courses.map((c) => {
          const ex = mapExtra.get(c.id);
          if (!ex) return c;
          return { ...c, studentsCount: ex.studentsCount, duration: ex.duration };
        });

        // update total students stat (sum)
        const totalStudents = this.courses.reduce((sum, c) => sum + (c.studentsCount ?? 0), 0);

        this.stats = this.stats.map((s) =>
          s.label === 'Students' ? { ...s, value: totalStudents } : s
        );
      });
  }

  // UI helpers
  private formatDuration(totalMinutes: number): string {
    if (!totalMinutes || totalMinutes <= 0) return '—';

    const hours = totalMinutes / 60;
    const days = hours / 6;
    const weeks = days / 5;

    if (weeks >= 1) return `${Math.round(weeks)} Weeks`;
    if (days >= 1) return `${Math.round(days)} Days`;
    return `${Math.round(hours)} Hours`;
  }

  // pagination actions
  nextPage(): void {
    if (this.page < this.totalPages) this.fetchAssignedCourses(this.page + 1);
  }

  prevPage(): void {
    if (this.page > 1) this.fetchAssignedCourses(this.page - 1);
  }

  // modal
  openSessionDetail(session: UpcomingSession) {
    this.selectedSessionDetail = this.mapToSessionDetail(session);
    this.isSessionDetailOpen = true;
  }

  closeSessionDetail() {
    this.isSessionDetailOpen = false;
  }

  joinFromModal() {
    const link = this.selectedSessionDetail?.meetingLink;
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  }

  private mapToSessionDetail(s: UpcomingSession): SessionDetail {
    return {
      sessionId: 'DEMO-001',
      type: s.type,
      course: '—',
      level: '—',
      date: s.date,
      time: s.time,
      student: {
        name: s.name,
        email: 'student@email.com',
        grade: '—',
        age: '—',
        learningPreferences: '—'
      },
      meetingLink: s.meetingLink
    };
  }

  openCourseDetail(course: CourseCard) {
    this.router.navigate(['/instructor/courses/course', course.id]);
  }

  goToInstructorQuiz() {
    this.router.navigate(['/instructor/instructor-quiz']);
  }
}

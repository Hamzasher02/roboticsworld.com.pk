

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, from, of, forkJoin } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfileHeaderComponent } from '../../components/profile-header/profile-header.component';

import {
  CoursesSessionDetailComponent,
  type SessionDetail,
} from '../../components/courses-session-detail/courses-session-detail.component';

import { SessionDetailComponent } from '../../components/session-detail/session-detail.component';
import { Session } from '../../../../core/interfaces/models/session.model';

import { CourseFeedbackService } from '../../../../core/services/teacher/feedback/course-feedback.service';
import { ApiCourseFeedbackItem } from '../../../../core/interfaces/teacher/feedback/feedback';

import { InstructorCoursesService } from '../../../../core/services/teacher/courses/courses.service';
import { ApiAssignedCourse } from '../../../../core/interfaces/teacher/courses/courses';

import { InstructorSessionsService } from '../../../../core/services/teacher/session/sessions.service';
import {
  ApiInstructorSessionItem,
  ApiSessionDetailModule,
} from '../../../../core/interfaces/teacher/sessions/manage-sessions';

// -------------------- TYPES --------------------
type StatCard = {
  value: number;
  label: string;
  icon: string;
  iconBg: string;
};

type CourseCard = {
  id: string;
  category: string;
  rating: number;
  reviews: number;
  title: string;
  duration: string;
  level: string;
  thumbnail: string;

  studentsCount: number; // ✅ dynamic
};

export type DashboardSessionType = 'Live Session' | 'Demo Session';

type SessionRow = {
  id: string;
  date: string;
  time: string;
  course: string;
  student: string;
  studentAvatar: string;

  // ✅ Session column now shows backend sessionStatus
  sessionText: string;
  sessionSub: string;

  // ✅ NEW: Type column like manage-sessions
  type: DashboardSessionType;

  // existing status badge (already in your UI)
  status: string;

  meetingLink?: string;
};

type DashboardFeedbackItem = {
  id: string;
  name: string;
  timeAgo: string;
  avatar: string;
  rating: number;
  message: string;
};

type SessionModalVm = {
  date: string;
  time: string;
  courseName: string;
  moduleName: string;
  studentName: string;
  status: string;
  sessionNumber: number | string;
  totalSessions: number;
  meetingLink?: string;
};

// ✅ students progress type from /coursesession/instructor/:courseId/students
type ApiStudentProgress = {
  _id: string;
  totalModules: number;
  modulesMarkedComplete: number;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProfileHeaderComponent,
    CoursesSessionDetailComponent,
    SessionDetailComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private feedbackApi: CourseFeedbackService,
    private coursesApi: InstructorCoursesService,
    private sessionsApi: InstructorSessionsService
  ) { }

  // -------------------- UI data --------------------
  // ✅ keep UI same, values will be updated dynamically
  stats: StatCard[] = [
    {
      value: 0,
      label: 'In-Process',
      icon: '/assets/instructor-images/courses/PlayCircle.svg',
      iconBg: 'bg-[#FFE9E6]',
    },
    {
      value: 0,
      label: 'Total Courses',
      icon: '/assets/instructor-images/courses/Notepad.svg',
      iconBg: 'bg-[#E7FFF0]',
    },
    {
      value: 0,
      label: 'Students',
      icon: '/assets/instructor-images/courses/UserCircle.svg',
      iconBg: 'bg-[#FFE9EF]',
    },
    {
      value: 0,
      label: 'Completed Courses',
      icon: '/assets/instructor-images/courses/Trophy.svg',
      iconBg: 'bg-[#E9FFF4]',
    },
  ];

  isStatsLoading = false;

  // -------------------- Courses --------------------
  coursesLoading = false;
  coursesPage = 1;
  coursesLimit = 10;
  coursesTotalPages = 1;
  coursesTotal = 0;
  courses: CourseCard[] = [];

  private readonly studentsCountCache = new Map<string, number>();

  // ✅ cache full progress list per course (so we can reuse for top stats)
  private readonly studentsProgressCache = new Map<string, ApiStudentProgress[]>();

  // -------------------- Sessions --------------------
  sessionsLoading = false;
  sessionsPage = 1;
  sessionsLimit = 10;
  sessions: SessionRow[] = [];

  // -------------------- Feedback --------------------
  feedbackFilter = 'Student';
  feedbackLoading = false;
  dashboardCourseId = '';
  dashboardFeedbacks: DashboardFeedbackItem[] = [];

  // ==========================================================
  // ✅ ONE MODAL COMPONENT FOR BOTH (Demo + Live) (unchanged)
  // ==========================================================
  showCourseSessionDetail = false;
  courseSessionDetailData: SessionDetail | null = null;
  courseSessionVariant: 'demo' | 'live' = 'demo';

  openCourseSessionDetail() {
    this.courseSessionVariant = 'demo';
    this.courseSessionDetailData = {
      sessionId: 'SES-1023',
      type: 'Demo Session',
      course: 'Data Science Fundamentals',
      level: 'Beginner',
      date: '17 Jan 2025',
      time: '04:00 PM - 05:00 PM',
      student: {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        grade: '10th',
        age: '15',
        learningPreferences: 'Visual learning',
      },
      meetingLink: 'https://zoom.us/j/123456789',
    };
    this.showCourseSessionDetail = true;
  }

  openLiveCourseSessionDetail() {
    this.courseSessionVariant = 'live';
    this.courseSessionDetailData = {
      sessionId: 'WEB-003',
      type: 'Live Session',
      course: 'Adobe XD for Web Design: ...',
      level: 'Intermediate',
      date: '1/16/2025',
      time: '2:00 PM - 3:00 PM',
      student: {
        name: 'Emily Johnson',
        email: 'sarah.johnson@email.com',
        grade: '10th Grade',
        age: '15 years',
        learningPreferences:
          'Interested in game development, prefers visual learning',
      },
      meetingLink: 'https://zoom.us/j/987654321',
      courseSchedule: {
        courseStartDate: '12/15/2024',
        sessionFrequency: 'Weekly',
        progressText: 'Session 3 of 12',
        firstSession: '12/22/2024',
        fixedTimeSlot: '2:00 PM - 3:00 PM',
        module: 'Introduction',
      },
    };
    this.showCourseSessionDetail = true;
  }

  closeCourseSessionDetail() {
    this.showCourseSessionDetail = false;
    this.courseSessionDetailData = null;
  }

  onJoinMeeting() {
    console.log('Meeting joined');
  }

  // ==========================================================
  // Modal B: SessionDetailComponent (table View) (unchanged)
  // ==========================================================
  showSessionDetailModal = false;
  selectedTableSession: Session | null = null;

  sessionDetailLoading = false;
  sessionDetailError = '';

  openTableSessionDetail(row: SessionRow) {
    this.showSessionDetailModal = true;
    this.sessionDetailLoading = true;
    this.sessionDetailError = '';

    const fallbackVm: SessionModalVm = {
      date: row.date,
      time: row.time,
      courseName: row.course,
      moduleName: '—',
      studentName: row.student,
      status: row.status,
      sessionNumber: row.sessionText,
      totalSessions: this.extractTotalSessions(row.sessionText),
      meetingLink: row.meetingLink,
    };
    this.selectedTableSession = fallbackVm as unknown as Session;

    this.sessionsApi
      .getSessionModulesDetail(row.id)
      .pipe(
        finalize(() => (this.sessionDetailLoading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          const session = res?.data?.session;
          const modules = res?.data?.modules ?? [];
          const mapped = this.mapSessionDetailToModalVm(session, modules);
          this.selectedTableSession = mapped as unknown as Session;
        },
        error: (err) => {
          console.error('getSessionModulesDetail API error:', err);
          this.sessionDetailError = 'Failed to load session details.';
        },
      });
  }

  closeTableSessionDetail() {
    this.showSessionDetailModal = false;
    this.selectedTableSession = null;
    this.sessionDetailLoading = false;
    this.sessionDetailError = '';
  }

  // -------------------- lifecycle --------------------
  ngOnInit(): void {
    const qpCourseId =
      this.route.snapshot.queryParamMap.get('courseId')?.trim() || '';
    this.loadAssignedCourses(this.coursesPage, this.coursesLimit, qpCourseId);
    this.loadMySessions();
  }

  // -------------------- Courses API --------------------
  loadAssignedCourses(page = 1, limit = 10, preferredCourseId = ''): void {
    this.coursesLoading = true;

    this.coursesApi
      .getMyAssignedCourses(page, limit)
      .pipe(finalize(() => (this.coursesLoading = false)))
      .subscribe({
        next: (res) => {
          const list = res?.data ?? [];
          this.courses = list.map((x) => this.mapAssignedCourseToCard(x));

          this.coursesPage = res?.pagination?.currentPage ?? page;
          this.coursesTotalPages = res?.pagination?.totalPages ?? 1;
          this.coursesTotal =
            res?.pagination?.totalCourses ?? this.courses.length;
          this.coursesLimit = res?.pagination?.limit ?? limit;

          const exists =
            preferredCourseId &&
            this.courses.some((c) => c.id === preferredCourseId);
          this.dashboardCourseId = exists
            ? preferredCourseId
            : this.courses[0]?.id || '';

          if (this.dashboardCourseId)
            this.loadDashboardFeedbacks();
          else this.dashboardFeedbacks = [];

          // ✅ students count (existing feature)
          this.loadStudentsCountsForCourses(this.courses);

          // ✅ NEW: Top Stats dynamic
          this.loadTopStatsFromCourses(this.coursesTotal, this.courses);
        },
        error: (err) => {
          console.error('getMyAssignedCourses api error:', err);
          this.courses = [];
          this.coursesTotalPages = 1;
          this.coursesTotal = 0;
          this.dashboardCourseId = '';
          this.dashboardFeedbacks = [];

          // reset stats
          this.updateStat('Total Courses', 0);
          this.updateStat('Students', 0);
          this.updateStat('Completed Courses', 0);
          this.updateStat('In-Process', 0);
        },
      });
  }

  private mapAssignedCourseToCard(x: ApiAssignedCourse): CourseCard {
    const anyX: any = x as any;
    const courseId = anyX?.course?._id || anyX?.courseId || x._id;

    return {
      id: String(courseId || '').trim(),
      category: x?.courseCategory?.[0] ?? '—',
      rating: 0,
      reviews: 0,
      title: x?.courseTitle ?? anyX?.course?.courseTitle ?? '—',
      duration: !x?.courseAccess
        ? '—'
        : String(x.courseAccess).toLowerCase() === 'free'
          ? 'Free access'
          : `${x.courseAccess} days access`,
      level: x?.courseLevel ?? '—',
      thumbnail:
        x?.courseThumbnail?.secureUrl ??
        '/assets/instructor-images/courses/Course Images.svg',
      studentsCount: 0,
    };
  }

  private loadStudentsCountsForCourses(courses: CourseCard[]): void {
    if (!courses?.length) return;

    from(courses)
      .pipe(
        mergeMap((c) => {
          const courseId = c?.id?.trim();
          if (!courseId) return of({ id: '', count: 0, list: [] as ApiStudentProgress[] });

          if (this.studentsCountCache.has(courseId) && this.studentsProgressCache.has(courseId)) {
            return of({
              id: courseId,
              count: this.studentsCountCache.get(courseId)!,
              list: this.studentsProgressCache.get(courseId)!,
            });
          }

          return this.coursesApi.getCourseStudentsProgress(courseId).pipe(
            map((res) => {
              const list = (res?.data ?? []) as ApiStudentProgress[];
              const count = list.length;

              this.studentsCountCache.set(courseId, count);
              this.studentsProgressCache.set(courseId, list);

              return { id: courseId, count, list };
            }),
            catchError((err) => {
              console.error('getCourseStudentsProgress error for course:', courseId, err);
              this.studentsCountCache.set(courseId, 0);
              this.studentsProgressCache.set(courseId, []);
              return of({ id: courseId, count: 0, list: [] as ApiStudentProgress[] });
            })
          );
        }, 4),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ id, count }) => {
        if (!id) return;

        const idx = this.courses.findIndex((x) => x.id === id);
        if (idx === -1) return;

        this.courses[idx] = { ...this.courses[idx], studentsCount: count };
        this.courses = [...this.courses];
      });
  }

  // ✅ NEW: Top stats dynamic calculation using coursesession/instructor/:courseId/students
  private loadTopStatsFromCourses(totalCourses: number, courses: CourseCard[]): void {
    // set total courses immediately
    this.updateStat('Total Courses', Number(totalCourses) || 0);

    if (!courses?.length) {
      this.updateStat('Students', 0);
      this.updateStat('Completed Courses', 0);
      this.updateStat('In-Process', 0);
      return;
    }

    this.isStatsLoading = true;

    const courseIds = courses.map((c) => (c?.id ?? '').trim()).filter(Boolean);

    const requests = courseIds.map((courseId) => {
      // use cache if exists
      if (this.studentsProgressCache.has(courseId)) {
        return of(this.studentsProgressCache.get(courseId)!);
      }

      return this.coursesApi.getCourseStudentsProgress(courseId).pipe(
        map((res) => (res?.data ?? []) as ApiStudentProgress[]),
        catchError((err) => {
          console.error('topStats getCourseStudentsProgress error:', courseId, err);
          return of([] as ApiStudentProgress[]);
        })
      );
    });

    forkJoin(requests)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isStatsLoading = false))
      )
      .subscribe((allLists) => {
        // unique students across all courses
        const unique = new Map<string, { completedAny: boolean; inProcessAny: boolean }>();

        allLists.forEach((list) => {
          (list ?? []).forEach((s) => {
            const sid = s?._id;
            if (!sid) return;

            const total = Number(s?.totalModules ?? 0);
            const done = Number(s?.modulesMarkedComplete ?? 0);

            const isCompleted = total > 0 && done >= total;
            const isInProcess = total > 0 && done < total;

            const prev = unique.get(sid) ?? { completedAny: false, inProcessAny: false };
            unique.set(sid, {
              completedAny: prev.completedAny || isCompleted,
              inProcessAny: prev.inProcessAny || isInProcess,
            });
          });
        });

        const totalStudents = unique.size;

        let completedStudents = 0;
        let inProcessStudents = 0;

        unique.forEach((v) => {
          if (v.completedAny) completedStudents += 1;
          else if (v.inProcessAny) inProcessStudents += 1;
        });

        // update cards
        this.updateStat('Students', totalStudents);
        this.updateStat('Completed Courses', completedStudents);
        this.updateStat('In-Process', inProcessStudents);
      });
  }

  private updateStat(label: string, value: number): void {
    const idx = this.stats.findIndex((s) => s.label === label);
    if (idx === -1) return;
    this.stats[idx] = { ...this.stats[idx], value: Number(value) || 0 };
    this.stats = [...this.stats];
  }

  // -------------------- Sessions API --------------------
  loadMySessions(page = 1, limit = 10): void {
    this.sessionsLoading = true;

    this.sessionsApi
      .getMySessions(page, limit)
      .pipe(finalize(() => (this.sessionsLoading = false)))
      .subscribe({
        next: (res) => {
          const list = res?.data ?? [];
          this.sessions = list.map((item) => this.mapApiSessionToRow(item));
          this.sessionsPage = res?.pagination?.page ?? page;
        },
        error: (err) => {
          console.error('getMySessions API error:', err);
          this.sessions = [];
        },
      });
  }

  // ✅ NEW helper like manage-sessions (Live/Demo)
  private mapEnrollmentTypeToSessionType(
    enrollmentType?: string
  ): DashboardSessionType {
    if ((enrollmentType ?? '').toLowerCase().includes('live'))
      return 'Live Session';
    return 'Demo Session';
  }

  private mapApiSessionToRow(item: ApiInstructorSessionItem): SessionRow {
    const formattedDate = this.formatYmdToDmy(item.sessionDate);
    const formattedTime =
      item.startTime && item.endTime
        ? `${item.startTime} - ${item.endTime}`
        : item.startTime || '—';

    const studentName =
      `${item.student?.firstName ?? ''} ${item.student?.lastName ?? ''
        }`.trim() || '—';

    const sessionText = item.sessionStatus ?? '—';

    const type = this.mapEnrollmentTypeToSessionType(
      item?.enrollment?.enrollmentType
    );

    const statusLower = String(item.sessionStatus ?? '').trim().toLowerCase();

    const status =
      statusLower === 'completed'
        ? 'Completed'
        : statusLower === 'scheduled'
          ? 'Scheduled'
          : statusLower === 'cancelled' || statusLower === 'canceled'
            ? 'Cancelled'
            : statusLower
              ? this.titleCase(statusLower)
              : '—';

    return {
      id: item._id,
      date: formattedDate,
      time: formattedTime,
      course: item.course?.courseTitle ?? '—',
      student: studentName,
      studentAvatar:
        item.student?.profilePicture?.secureUrl ??
        '/assets/instructor-images/courses/Photo.svg',

      sessionText,
      sessionSub: '',

      type,

      status,
      meetingLink: item.sessionLink,
    };
  }

  private titleCase(v: string): string {
    return v
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  private mapSessionDetailToModalVm(
    session: any,
    modules: ApiSessionDetailModule[]
  ): SessionModalVm {
    const sessionDate = this.formatYmdToDmy(session?.sessionDate);
    const time =
      session?.startTime && session?.endTime
        ? `${session.startTime} - ${session.endTime}`
        : session?.startTime || '—';

    const studentName =
      `${session?.student?.firstName ?? ''} ${session?.student?.lastName ?? ''
        }`.trim() || '—';

    const statusLower = String(session?.sessionStatus ?? '').toLowerCase();
    const status = statusLower === 'completed' ? 'Completed' : 'Upcoming';

    const chosen = modules.find((m) => !m.isCompleted) ?? modules[0];

    return {
      date: sessionDate || '—',
      time: time || '—',
      courseName: session?.course?.courseTitle ?? '—',
      moduleName: chosen?.moduleName ?? '—',
      studentName,
      status,
      sessionNumber: session?.sessionNumber ?? '—',
      totalSessions: Number(session?.totalSessions ?? 0),
      meetingLink: session?.sessionLink ?? '',
    };
  }

  private formatYmdToDmy(ymd?: string): string {
    const parts = (ymd || '').split('-');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : ymd || '—';
  }

  private extractTotalSessions(sessionText: string): number {
    const m = String(sessionText || '').match(/of\s+(\d+)/i);
    return m ? Number(m[1]) : 0;
  }

  loadDashboardFeedbacks(): void {
    this.feedbackLoading = true;

    this.feedbackApi
      .getInstructorWiseAllCourseFeedback()
      .pipe(finalize(() => (this.feedbackLoading = false)))
      .subscribe({
        next: (res: any) => {
          const payload = Array.isArray(res) ? res[0] : res;
          const list = (payload?.data ?? []) as ApiCourseFeedbackItem[];

          // ✅ show ALL (no slice)
          this.dashboardFeedbacks = list.map((x) => this.mapFeedbackToDash(x));
        },
        error: (err) => {
          console.error('dashboard feedback api error:', err);
          this.dashboardFeedbacks = [];
        },
      });
  }


  private mapFeedbackToDash(x: ApiCourseFeedbackItem): DashboardFeedbackItem {
    const name =
      `${x?.user?.firstName ?? ''} ${x?.user?.lastName ?? ''}`.trim() || '—';
    return {
      id: x._id,
      name,
      timeAgo: this.timeAgoFromIso(x.createdAt),
      avatar:
        x?.user?.profilePicture?.secureUrl ??
        '/assets/instructor-images/courses/Photo.svg',
      rating: Number(x.rating ?? 0),
      message: x.feedbackText ?? '—',
    };
  }

  private timeAgoFromIso(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';

    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return `${diffSec} sec ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mins ago`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hours ago`;

    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} days ago`;

    const diffWeek = Math.floor(diffDay / 7);
    return `${diffWeek} week ago`;
  }

  // -------------------- navigation --------------------
  openCourseDetail(course: CourseCard) {
    this.router.navigate(['/instructor/courses/course', course.id]);
  }

  goToFeedback(courseId?: string) {
    const id = courseId || this.dashboardCourseId || this.courses[0]?.id;
    if (!id) return;

    this.router.navigate(['/instructor/dashboard/feedback'], {
      queryParams: { courseId: id },
    });
  }

  goToManageSessions() {
    this.router.navigate(['/instructor/manage-sessions']);
  }

  // -------------------- helpers --------------------
  starsArray(n: number) {
    const rating = Math.max(0, Math.min(5, Number(n) || 0));
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) img.src = '/assets/images/avatar.png';
  }

  trackByStat = (_: number, s: StatCard) => s.label;
  trackBySession = (_: number, s: SessionRow) => s.id;
  trackByFeedback = (_: number, f: DashboardFeedbackItem) => f.id;
  trackByCourse = (_: number, c: CourseCard) => c.id;
}

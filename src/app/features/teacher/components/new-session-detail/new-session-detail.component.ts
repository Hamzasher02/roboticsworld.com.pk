import { CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { InstructorSessionsService } from '../../../../core/services/teacher/session/sessions.service';
import { InstructorCoursesService } from '../../../../core/services/teacher/courses/courses.service';
import {
  GetInstructorSessionModulesDetailResponse,
  ApiSessionDetailModule,
} from '../../../../core/interfaces/teacher/sessions/manage-sessions';
import { ApiCourseModule } from '../../../../core/interfaces/teacher/courses/courses';

type SessionStatus = 'completed' | 'active' | 'upcoming';

type SessionItem = {
  id: string;             // moduleId
  title: string;          // moduleName
  description: string;    // ✅ moduleDescription
  sessionNo: number;      // moduleIndex
  status: SessionStatus;
};

type ModuleItem = {
  id: string;             // moduleId
  sessions: SessionItem[];
};

type StudentInfo = {
  name: string;
  role: string;
  avatar: string;
  duration: string;
  durationIcon: string;
  days: string;
  time: string;
};

type LiveSessionInfo = {
  title: string;
  whenText: string;
  icon: string;
  calendarIcon: string;
  clockIcon: string;
  joinIcon: string;
  joinText: string;
  startsAt?: Date;
};

@Component({
  selector: 'app-new-session-detail',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './new-session-detail.component.html',
  styleUrl: './new-session-detail.component.css',
})
export class NewSessionDetailComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sessionsService: InstructorSessionsService,
    private coursesService: InstructorCoursesService
  ) {}

  isLoading = false;

  // ✅ store sessionId for mark-complete API
  private sessionId = '';

  // ✅ store courseId (optional)
  private courseId = '';

  // ✅ prevent double click per module
  private completingModuleIds = new Set<string>();

  lockActiveSession = false;
  sessionLink = '';

  student: StudentInfo = {
    name: '—',
    role: 'Student',
    avatar: '/assets/instructor-images/session/IMG-497.svg',
    duration: '—',
    durationIcon: '/assets/instructor-images/session/Calendar.svg',
    days: '—',
    time: '—',
  };

  liveSession: LiveSessionInfo | null = null;
  modules: ModuleItem[] = [];

  get totalSessions(): number {
    return this.modules.reduce((acc, m) => acc + m.sessions.length, 0);
  }

  get completedSessions(): number {
    return this.modules.reduce(
      (acc, m) => acc + m.sessions.filter((s) => s.status === 'completed').length,
      0
    );
  }

  get remainingSessions(): number {
    return Math.max(this.totalSessions - this.completedSessions, 0);
  }

  get progressPercent(): number {
    const total = this.totalSessions;
    if (!total) return 0;
    return Math.round((this.completedSessions / total) * 100);
  }

  liveCountdown = '00:00:00';
  private timerId: any;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('sessionId');
    if (!id) {
      this.goBack();
      return;
    }
    this.sessionId = id;
    this.fetchDetail(id);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  private fetchDetail(sessionId: string): void {
    this.isLoading = true;

    this.sessionsService.getSessionModulesDetail(sessionId).subscribe({
      next: (res: GetInstructorSessionModulesDetailResponse) => {
        const data = res?.data;
        if (!data?.session) {
          this.isLoading = false;
          return;
        }

        // Extract courseId (optional)
        const courseId = data.session.course?._id;
        this.courseId = courseId || '';

        // Bind session info
        this.bindSessionInfo(data.session);

        // countdown
        this.updateCountdown();
        if (this.timerId) clearInterval(this.timerId);
        this.timerId = setInterval(() => this.updateCountdown(), 1000);

        // ✅ IMPORTANT:
        // For description you asked: we must use modules coming from THIS API (data.modules)
        this.bindModulesFromSessionApi(data.modules ?? []);

        // (Optional) If you still need course modules API later, you can call it here.
        // But right now we are using session modules response because it has moduleDescription.
        // if (courseId) this.fetchCourseModules(courseId);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('session modules-detail api error:', err);
        this.isLoading = false;
      },
    });
  }

  // (Optional) course modules api (kept, but not used for description requirement)
  private fetchCourseModules(courseId: string): void {
    this.coursesService
      .getCourseModulesUserSide(courseId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          if (res?.success && res?.data) {
            const activeModules = res.data.filter((m: ApiCourseModule) => !m.isDeleted);
            this.bindModulesFromCourseApi(activeModules);
          }
        },
        error: (err) => {
          console.error('course modules api error:', err);
        },
      });
  }

  private bindModulesFromCourseApi(modules: ApiCourseModule[]): void {
    this.modules = modules.map((m) => ({
      id: m._id,
      sessions: [
        {
          id: m._id,
          title: m.moduleName,
          description: (m as any)?.moduleDescription ?? '', // if exists
          sessionNo: m.moduleIndex,
          status: m.completed ? 'completed' : 'upcoming',
        },
      ],
    }));
  }

  // ✅ Use moduleDescription from session modules API
  private bindModulesFromSessionApi(modules: ApiSessionDetailModule[]): void {
    this.modules = modules.map((m) => ({
      id: m._id,
      sessions: [
        {
          id: m._id, // moduleId
          title: m.moduleName, // ✅ Introduction to Programming
          description: (m as any)?.moduleDescription ?? '', // ✅ ksnkjdksjkdskdks
          sessionNo: m.moduleIndex, // badge number
          status: m.isCompleted ? 'completed' : 'upcoming',
        },
      ],
    }));
  }

  private bindSessionInfo(session: any): void {
    const s = session;

    this.sessionLink = s?.sessionLink ?? '';

    const fullName =
      `${s?.student?.firstName ?? ''} ${s?.student?.lastName ?? ''}`.trim() || '—';

    this.student = {
      name: fullName,
      role: 'Student',
      avatar: s?.student?.profilePicture?.secureUrl ?? '/assets/instructor-images/session/IMG-497.svg',
      duration: `${s?.totalSessions ?? 0} Sessions`,
      durationIcon: '/assets/instructor-images/session/Calendar.svg',
      days: 'Mon- Friday',
      time: `${this.formatTime12h(s.startTime)} to ${this.formatTime12h(s.endTime)}`,
    };

    const whenText = `${this.formatDateUi(s.sessionDate)} – ${this.formatTime12h(s.startTime)} PKT`;

    this.liveSession = {
      title: 'Live Sessions',
      whenText,
      icon: '/assets/instructor-images/session/Video Camera with Play Button.svg',
      calendarIcon: '/assets/instructor-images/session/Calendar (1).svg',
      clockIcon: '/assets/instructor-images/session/Clock (1).svg',
      joinIcon: '/assets/instructor-images/session/Video Camera with Play Button (1).svg',
      joinText: 'Join Live Class',
      startsAt: this.buildStartDateTime(s.sessionDate, s.startTime),
    };
  }

  private updateCountdown(): void {
    if (!this.liveSession?.startsAt) {
      this.liveCountdown = '00:00:00';
      return;
    }

    const diff = this.liveSession.startsAt.getTime() - Date.now();
    if (diff <= 0) {
      this.liveCountdown = '00:00:00';
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    this.liveCountdown = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  goBack(): void {
    this.router.navigate(['/instructor/manage-sessions']);
  }

  joinLiveClass(): void {
    if (!this.sessionLink) return;
    window.open(this.sessionLink, '_blank');
  }

  // ✅ Checkbox click -> mark complete
  toggleSession(moduleId: string, sessionId: string): void {
    const mod = this.modules.find((m) => m.id === moduleId);
    if (!mod) return;

    const ses = mod.sessions.find((s) => s.id === sessionId);
    if (!ses) return;

    if (ses.status === 'completed') return;
    if (this.completingModuleIds.has(moduleId)) return;

    const prevStatus = ses.status;
    ses.status = 'completed';
    this.completingModuleIds.add(moduleId);

    this.sessionsService
      .markModuleComplete(this.sessionId, moduleId)
      .pipe(finalize(() => this.completingModuleIds.delete(moduleId)))
      .subscribe({
        next: (res) => {
          const ok = !!res?.data?.isCompleted;
          if (!ok) ses.status = prevStatus;
        },
        error: (err) => {
          console.error('mark-complete api error:', err);
          ses.status = prevStatus;
        },
      });
  }

  trackByModuleId(_: number, m: ModuleItem): string {
    return m.id;
  }

  trackBySessionId(_: number, s: SessionItem): string {
    return s.id;
  }

  private formatDateUi(isoDate: string): string {
    if (!isoDate) return '—';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) return isoDate;
    return `${d}-${m}-${y}`;
  }

  private formatTime12h(hhmm: string): string {
    if (!hhmm) return '—';
    const [hhStr, mm] = hhmm.split(':');
    const hh = Number(hhStr);
    if (!Number.isFinite(hh) || !mm) return hhmm;

    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = ((hh + 11) % 12) + 1;
    return `${h12}:${mm} ${ampm}`;
  }

  private buildStartDateTime(dateISO: string, timeHHMM: string): Date | undefined {
    if (!dateISO || !timeHHMM) return undefined;

    const [hh, mm] = timeHHMM.split(':').map(Number);
    const d = new Date(dateISO);

    if (!Number.isFinite(hh) || !Number.isFinite(mm) || isNaN(d.getTime())) return undefined;
    d.setHours(hh, mm, 0, 0);
    return d;
  }
}

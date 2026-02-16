// manage-sessions.component.ts
import { Component, AfterViewInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { initFlowbite } from 'flowbite';

import { InstructorSessionsService } from '../../../../core/services/teacher/session/sessions.service';
import { ApiInstructorSessionItem } from '../../../../core/interfaces/teacher/sessions/manage-sessions';

export type SessionType = 'Live Session' | 'Demo Session';

export interface Session {
  id: string;
  date: string; // UI string
  time: string; // UI string
  studentName: string;
  studentImage: string;
  sessionNumber: string; // "2 of 12"
  totalSessions: number;
  type: SessionType;
  courseName: string;
  courseLevel: string; // API me nahi -> placeholder
  moduleName: string;  // API me nahi -> placeholder
  meetingLink: string;
  status: string;      // "scheduled" etc (internal use)
  rawDateISO: string;  // sorting
}

@Component({
  selector: 'app-manage-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-sessions.component.html',
})
export class ManageSessionsComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private sessionsService: InstructorSessionsService
  ) {}

  ngAfterViewInit() {
    setTimeout(() => initFlowbite(), 0);
  }

  activeTab: 'upcoming' | 'previous' = 'upcoming';

  selectedSessionType: string = 'Session Type';
  selectedSessionTypePrev: string = 'Session Type';

  // ✅ API driven
  upcomingSessions: Session[] = [];
  previousSessions: Session[] = [];

  isLoading = false;

  // ✅ pagination (from backend) -> live sessions pagination
  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  ngOnInit(): void {
    this.fetchSessions(1);
  }

fetchSessions(page: number): void {
  this.isLoading = true;
  this.page = page;

  forkJoin({
    live: this.sessionsService.getMySessions(this.page, this.limit),
    demo: this.sessionsService.getInstructorDemoSessions(),
  })
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => (this.isLoading = false))
    )
    .subscribe({
      next: ({ live, demo }) => {
        const liveList = live?.data ?? [];
        const demoList = demo?.data ?? [];

        // ✅ keep pagination from live (as-is)
        this.total = live?.pagination?.total ?? liveList.length;
        this.pages = live?.pagination?.pages ?? 1;
        this.limit = live?.pagination?.limit ?? this.limit;

        // ✅ IMPORTANT: enrollment null wali live sessions ko hide karo
        const liveAssignedOnly = liveList.filter(
          (x: ApiInstructorSessionItem) => !!x?.enrollment
        );

        const liveMapped = liveAssignedOnly.map((x: ApiInstructorSessionItem) =>
          this.mapApiToUi(x)
        );

        const demoMapped = demoList.map((x: any) => this.mapDemoApiToUi(x));

        const merged = [...liveMapped, ...demoMapped];

        this.splitUpcomingPrevious(merged);
      },
      error: (err) => {
        console.error('sessions api error:', err);
        this.upcomingSessions = [];
        this.previousSessions = [];
        this.total = 0;
        this.pages = 1;
      },
    });
}


  private splitUpcomingPrevious(all: Session[]): void {
    const now = new Date();

    const upcoming: Session[] = [];
    const previous: Session[] = [];

    for (const s of all) {
      const d = this.safeParseDate(s.rawDateISO);
      const isFutureOrToday = d ? d.getTime() >= this.startOfDay(now).getTime() : false;

      // ✅ upcoming: future/today OR status scheduled
      if (isFutureOrToday || (s.status ?? '').toLowerCase() === 'scheduled') upcoming.push(s);
      else previous.push(s);
    }

    // sorting
    upcoming.sort((a, b) => (a.rawDateISO > b.rawDateISO ? 1 : -1));
    previous.sort((a, b) => (a.rawDateISO < b.rawDateISO ? 1 : -1));

    this.upcomingSessions = upcoming;
    this.previousSessions = previous;
  }

 private mapApiToUi(x: ApiInstructorSessionItem): Session {
  const studentName =
    `${x?.student?.firstName ?? ''} ${x?.student?.lastName ?? ''}`.trim() || '—';

  const time = `${this.formatTime12h(x.startTime)} - ${this.formatTime12h(x.endTime)}`;

  return {
    id: x._id,
    date: this.formatDateUi(x.sessionDate),
    time,
    studentName,
    studentImage: x?.student?.profilePicture?.secureUrl ?? '/assets/instructor-images/courses/Photo.svg',

    // ✅ ONLY CHANGE: show backend sessionStatus in Session column
    sessionNumber: x?.sessionStatus ?? '—',

    totalSessions: x.totalSessions,
    type: this.mapEnrollmentTypeToSessionType(x?.enrollment?.enrollmentType),
    courseName: x?.course?.courseTitle ?? '—',
    courseLevel: '—',
    moduleName: '—',
    meetingLink: x?.sessionLink ?? '',
    status: x?.sessionStatus ?? '',
    rawDateISO: x.sessionDate,
  };
}


  private mapDemoApiToUi(x: any): Session {
    const iso = (x?.preferredDate ?? '').toString();
    const rawDateISO = iso ? iso.slice(0, 10) : '';

    const studentName =
      `${x?.student?.firstName ?? ''} ${x?.student?.lastName ?? ''}`.trim() || '—';

    const demoId = x?._id ?? x?.id ?? `${rawDateISO}-${studentName}`;

    return {
      id: demoId,
      date: rawDateISO ? this.formatDateUi(rawDateISO) : '—',
      time: x?.preferredTime ?? '—',
      studentName,
      studentImage: x?.student?.profilePicture?.secureUrl ?? '/assets/instructor-images/courses/Photo.svg',
      sessionNumber: `1 of 1`,
      totalSessions: 1,
      type: 'Demo Session',
      courseName: x?.course?.courseTitle ?? '—',
      courseLevel: '—',
      moduleName: '—',
      meetingLink: x?.demoSessionLink ?? '',
      status: x?.status ?? 'scheduled',
      rawDateISO: rawDateISO || '',
    };
  }

  private mapEnrollmentTypeToSessionType(enrollmentType?: string): SessionType {
    if ((enrollmentType ?? '').toLowerCase().includes('live')) return 'Live Session';
    return 'Demo Session';
  }

  filteredUpcomingSessions(): Session[] {
    if (this.selectedSessionType === 'Session Type') return this.upcomingSessions;
    return this.upcomingSessions.filter((s) => s.type === this.selectedSessionType);
  }

  filteredPreviousSessions(): Session[] {
    if (this.selectedSessionTypePrev === 'Session Type') return this.previousSessions;
    return this.previousSessions.filter((s) => s.type === this.selectedSessionTypePrev);
  }

  trackByKey(_: number, s: Session): string {
    return s.id;
  }

  // ✅ pagination controls (live sessions pagination)
  nextPage(): void {
    if (this.page < this.pages) this.fetchSessions(this.page + 1);
  }

  prevPage(): void {
    if (this.page > 1) this.fetchSessions(this.page - 1);
  }

  goBack(): void {
    this.router.navigate(['/instructor/dashboard']);
  }

  // ---------- helpers ----------
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

  private safeParseDate(isoDate: string): Date | null {
    if (!isoDate) return null;
    const d = new Date(isoDate);
    return isNaN(d.getTime()) ? null : d;
  }

  private startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }
}

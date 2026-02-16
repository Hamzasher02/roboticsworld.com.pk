// demo-session.component.ts
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DemoSessionService, DemoSessionRequest, GetAllDemoSessionsResponse } from '../../../../../core/services/admin/demo-session/demo-session.service';
import { AllInstructorService } from '../../../../../core/services/admin/all-instructor/all-instructor.service';
import { AdminCourseService } from '../../../../../core/services/admin/course/admin-course.service';
import { StatusModalComponent } from '../../../../../shared/components/status-modal/status-modal.component';

type Instructor = { id: string; name: string };
type Student = { name: string; email: string; avatar: string };

type DemoRequestDummy = {
  id: string;

  // ✅ tab marker (upcoming / previous)
  sessionTab: 'upcoming' | 'previous';

  student: Student;
  courseCategory: string;
  subCategory: string;
  courseName: string;
  level: string;
  ageGroup: string;
  date: string;
  startTime: string;
  endTime: string;
  requestDate: string;

  instructorId?: string;
  sessionLink?: string;
};

type SessionCard = {
  id: string;
  title: string;
  category: string;
  instructor: string;
  date: string;
  time: string;
};

@Component({
  selector: 'app-demo-session',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent],
  templateUrl: './demo-session.component.html',
})
export class DemoSessionComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  requestId = '';

  // ✅ Demo Only (no live)
  student: Student = {
    name: '',
    email: '',
    avatar: '',
  };

  instructors: Instructor[] = [];

  // main form (demo request details + editable fields)
  form = {
    courseCategory: '',
    subCategory: '',
    courseName: '',
    level: '',
    ageGroup: '',
    date: '',
    startTime: '',
    endTime: '',
    requestDate: '',
    instructorId: '',
    sessionLink: '',
    status: '',
  };

  linkError = '';

  // Status Modal
  statusModal = {
    show: false,
    title: '',
    message: '',
    type: 'Success' as 'Success' | 'Error'
  };

  // ✅ Pagination
  pageSize = 4;
  currentPage = 1;

  // ✅ Tabs
  activeSessionTab: 'upcoming' | 'previous' = 'upcoming';

  // ✅ Demo-only dataset (upcoming + previous) — single source of truth
  private requests: DemoSessionRequest[] = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private demoService: DemoSessionService,
    private instructorService: AllInstructorService,
    private adminCourseService: AdminCourseService
  ) { }

  ngOnInit(): void {
    this.fetchRequests();

    this.sub.add(
      this.route.paramMap.subscribe((pm) => {
        this.requestId = pm.get('id') ?? '';
        if (this.requests.length > 0) {
          this.applyById(this.requestId);
        }
      })
    );
  }

  fetchInstructors(courseId: string) {
    if (!courseId) return;
    this.adminCourseService.getAssignedInstructors(courseId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.instructors = res.data.map((i: any) => {
            const userData = i.user || i;
            return {
              id: userData._id || userData.id || i._id || i.id || '',
              name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.name || 'Unknown'
            };
          }).filter((ins: any) => ins.id);
        }
      },
      error: (err) => {
        console.error('Failed to fetch course instructors', err);
        this.instructors = [];
      }
    });
  }

  fetchRequests() {
    this.demoService.getAllDemoSessionRequests().subscribe({
      next: (res: GetAllDemoSessionsResponse) => {
        if (res.success) {
          this.requests = res.data;
          this.applyById(this.requestId);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // =========================
  // UI helpers
  // =========================
  goBack() {
    this.location.back();
  }

  get selectedInstructorName(): string {
    return this.instructors.find((i) => i.id === this.form.instructorId)?.name ?? '—';
  }

  onInstructorChange() {
    // no-op (kept)
  }

  onLinkInput() {
    this.validateLink();
  }

  // =========================
  // Tabs
  // =========================
  setSessionTab(tab: 'upcoming' | 'previous') {
    this.activeSessionTab = tab;
    this.currentPage = 1;
  }

  // =========================
  // Sessions (Derived)
  // =========================
  private toSessionCard(r: DemoSessionRequest): SessionCard {
    return {
      id: r._id,
      title: r.course?.courseTitle || 'Unknown Course',
      category: r.category || 'N/A',
      instructor: `${r.student?.firstName || 'Unknown'} ${r.student?.lastName || ''}`.trim(),
      date: new Date(r.preferredDate).toLocaleDateString(),
      time: r.preferredTime || 'N/A',
    };
  }

  get upcomingSessions(): SessionCard[] {
    return this.requests
      .filter((r) => r.status === 'approved' && new Date(r.preferredDate) >= new Date())
      .map((r) => this.toSessionCard(r));
  }

  get previousSessions(): SessionCard[] {
    return this.requests
      .filter((r) => r.status === 'approved' && new Date(r.preferredDate) < new Date())
      .map((r) => this.toSessionCard(r));
  }

  get totalPages(): number {
    const totalItems =
      this.activeSessionTab === 'upcoming' ? this.upcomingSessions.length : this.previousSessions.length;

    return Math.max(1, Math.ceil(totalItems / this.pageSize));
  }

  get canPrev(): boolean {
    return this.currentPage > 1;
  }

  get canNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  prevPage() {
    if (this.canPrev) this.currentPage -= 1;
  }

  nextPage() {
    if (this.canNext) this.currentPage += 1;
  }

  private paginate(list: SessionCard[]): SessionCard[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  get pagedUpcomingSessions(): SessionCard[] {
    return this.paginate(this.upcomingSessions);
  }

  get pagedPreviousSessions(): SessionCard[] {
    return this.paginate(this.previousSessions);
  }

  trackById(_: number, item: SessionCard) {
    return item.id;
  }

  // ✅ delete only for previous tab
  onDeletePrevious(id: string) {
    const idx = this.requests.findIndex((x) => x.id === id);
    if (idx > -1) this.requests.splice(idx, 1);

    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
  }

  // =========================
  // Data binding by route id
  // =========================
  private applyById(id: string) {
    if (!id) {
      const first = this.requests.find((x) => x.status === 'pending') ?? this.requests[0];
      if (first) this.patchFromRequest(first);
      return;
    }

    const found = this.requests.find((r) => r._id === id);
    if (!found) {
      const first = this.requests.find((x) => x.status === 'pending') ?? this.requests[0];
      if (first) this.patchFromRequest(first);
      return;
    }

    this.patchFromRequest(found);
  }

  private patchFromRequest(r: DemoSessionRequest) {
    this.student = {
      name: `${r.student?.firstName || 'Unknown'} ${r.student?.lastName || ''}`.trim(),
      email: r.student?.email || 'N/A',
      avatar: r.student?.profilePicture?.secureUrl || 'https://i.pravatar.cc/150?img=3'
    };

    this.form = {
      courseCategory: r.category || '',
      subCategory: r.subcategory || '',
      courseName: r.course?.courseTitle || '',
      level: r.course?.courseLevel || 'null',
      ageGroup: r.course?.courseAgeGroup || '',
      date: new Date(r.preferredDate).toLocaleDateString(),
      startTime: r.preferredTime || '',
      endTime: '', // End time not provided in sample API
      requestDate: new Date(r.createdAt).toLocaleDateString(),
      instructorId: r.instructorId ?? '',
      sessionLink: r.demoSessionLink ?? '',
      status: r.status || 'pending',
    };

    this.activeSessionTab = (r.status === 'approved' && new Date(r.preferredDate) < new Date()) ? 'previous' : 'upcoming';
    this.currentPage = 1;
    this.linkError = '';

    if (r.courseId) {
      this.fetchInstructors(r.courseId);
    } else if (r.course?._id) {
      this.fetchInstructors(r.course._id);
    }
  }

  // =========================
  // Actions
  // =========================
  onCancel() {
    this.goBack();
  }

  get canSchedule(): boolean {
    return !!this.form.instructorId && !!this.form.sessionLink.trim() && !this.linkError;
  }

  private validateLink() {
    const link = this.form.sessionLink.trim();

    if (!link) {
      this.linkError = '';
      return;
    }

    try {
      const u = new URL(link);
      const isHttp = u.protocol === 'http:' || u.protocol === 'https:';
      if (!isHttp) {
        this.linkError = 'Link must start with http:// or https://';
        return;
      }
      this.linkError = '';
    } catch {
      this.linkError = 'Please enter a valid URL.';
    }
  }
  onSchedule() {
    this.validateLink();

    if (!this.canSchedule) {
      return;
    }

    this.demoService.approveAndAssignInstructor(this.requestId, {
      instructorId: this.form.instructorId,
      demoSessionLink: this.form.sessionLink.trim()
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.openStatusModal('Success', res.message || 'Demo session scheduled successfully.', 'Success');
          this.fetchRequests(); // Refresh data
        }
      },
      error: (err: any) => {
        console.error('Failed to schedule demo session', err);
        const msg = err?.error?.message || err?.message || 'Failed to schedule demo session';
        this.openStatusModal('Error', msg, 'Error');
      }
    });
  }

  openStatusModal(title: string, message: string, type: 'Success' | 'Error') {
    this.statusModal = {
      show: true,
      title,
      message,
      type
    };
  }

  closeStatusModal() {
    this.statusModal.show = false;
  }
}

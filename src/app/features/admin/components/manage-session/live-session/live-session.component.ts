// live-session.component.ts
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CourseSessionService } from '../../../../../core/services/admin/course-session/course-session.service';
import { AllInstructorService } from '../../../../../core/services/admin/all-instructor/all-instructor.service';
import { AdminCourseService } from '../../../../../core/services/admin/course/admin-course.service';
import { StatusModalComponent } from '../../../../../shared/components/status-modal/status-modal.component';

type Instructor = { id: string; name: string };
type Student = { name: string; email: string; avatar: string };

type LiveRequestDummy = {
  id: string;

  // ✅ tab marker (upcoming / previous)
  sessionTab: 'upcoming' | 'previous';

  student: Student;
  courseCategory: string;
  subCategory: string;
  courseName: string;
  level: string;
  ageGroup: string;

  // ✅ Start + End date
  date: string;
  endDate: string;

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
  selector: 'app-live-session',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent],
  templateUrl: './live-session.component.html',
  styleUrl: './live-session.component.css'
})
export class LiveSessionComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  requestId = '';
  enrollmentId = '';
  isLoading = false;

  statusModal = {
    show: false,
    title: '',
    message: '',
    type: 'Success' as 'Success' | 'Error'
  };

  student: Student = {
    name: '',
    email: '',
    avatar: '',
  };

  instructors: Instructor[] = [];

  // ✅ main form (only NEW field is endDate)
  form = {
    courseCategory: '',
    subCategory: '',
    courseName: '',
    level: '',
    ageGroup: '',
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    requestDate: '',
    instructorId: '',
    sessionLink: '',
    enrollmentType: '',
    enrollmentStatus: '',
  };

  linkError = '';

  // ✅ Pagination
  pageSize = 4;
  currentPage = 1;

  // ✅ Tabs
  activeSessionTab: 'upcoming' | 'previous' = 'upcoming';

  // ✅ Dummy dataset (live session demo) + includes endDate
  private requests: LiveRequestDummy[] = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private courseSessionService: CourseSessionService,
    private instructorService: AllInstructorService,
    private adminCourseService: AdminCourseService
  ) { }

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe((pm) => {
        this.requestId = pm.get('id') ?? '';
        if (this.requestId && this.requestId.length > 5) {
          this.fetchSessionDetails(this.requestId);
        } else {
          this.applyById(this.requestId);
        }
      })
    );
  }

  fetchSessionDetails(enrollmentId: string) {
    this.isLoading = true;
    this.courseSessionService.getSingleSession(enrollmentId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const s = Array.isArray(res.data) ? res.data[0] : res.data;
          if (!s) {
            this.isLoading = false;
            return;
          }
          this.enrollmentId = s._id || '';
          this.student = {
            name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim(),
            email: s.user?.email || '',
            avatar: s.user?.profilePicture?.secureUrl || 'https://picsum.photos/200/200.jpg'
          };

          // Handle time slot splitting
          const timeSlot = s.preferredClassTime || '';
          const parts = timeSlot.split(' - ');
          const startTime = this.formatTimeToHHMM(parts[0] || '');
          const endTime = this.addOneHour(startTime);

          // Calculate End Date: Start Date (createdAt) + courseAccess (days)
          let startDateStr = '';
          let endDateStr = '';
          if (s.createdAt) {
            const startDate = new Date(s.createdAt);
            startDateStr = this.formatDateToYYYYMMDD(startDate);

            const accessDays = parseInt(s.course?.courseAccess || '0', 10);
            if (!isNaN(accessDays) && accessDays > 0) {
              const endDate = new Date(startDate);
              endDate.setDate(startDate.getDate() + accessDays);
              endDateStr = this.formatDateToYYYYMMDD(endDate);
            }
          }

          this.form = {
            courseCategory: (Array.isArray(s.course?.courseCategory) ? s.course.courseCategory[0] : s.course?.courseCategory) || '',
            subCategory: s.course?.courseSubCategory || '',
            courseName: s.course?.courseTitle || '',
            level: s.course?.courseLevel || '',
            ageGroup: s.course?.courseAgeGroup || '',
            date: startDateStr,
            endDate: endDateStr,
            startTime: startTime,
            endTime: endTime,
            requestDate: startDateStr,
            instructorId: s.instructorId ?? '',
            sessionLink: '',
            enrollmentType: s.enrollmentType || '',
            enrollmentStatus: s.isSessionAssigned ? 'approved' : 'pending',
          };

          if (s.course?._id) {
            this.fetchInstructors(s.course._id);
          }
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to fetch enrollment detail', err);
        const msg = err?.error?.message || 'Failed to fetch enrollment details.';
        this.openModal('Error', msg);
        this.isLoading = false;
      }
    });
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
        this.openModal('Error', 'Failed to fetch course instructors.');
        this.instructors = [];
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
    // kept (no changes)
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
  private toSessionCard(r: LiveRequestDummy): SessionCard {
    return {
      id: r.id,
      title: r.courseName,
      category: r.courseCategory,
      instructor: r.student.name,
      date: r.date,
      time: `${r.startTime} - ${r.endTime}`,
    };
  }

  get upcomingSessions(): SessionCard[] {
    return this.requests
      .filter((r) => r.sessionTab === 'upcoming')
      .map((r) => this.toSessionCard(r));
  }

  get previousSessions(): SessionCard[] {
    return this.requests
      .filter((r) => r.sessionTab === 'previous')
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
      const first = this.requests.find((x) => x.sessionTab === 'upcoming') ?? this.requests[0];
      if (first) this.patchFromRequest(first);
      return;
    }

    const found = this.requests.find((r) => r.id === id);
    if (!found) {
      const first = this.requests.find((x) => x.sessionTab === 'upcoming') ?? this.requests[0];
      if (first) this.patchFromRequest(first);
      return;
    }

    this.patchFromRequest(found);
  }

  private patchFromRequest(r: LiveRequestDummy) {
    this.student = { ...r.student };

    this.form = {
      courseCategory: r.courseCategory,
      subCategory: r.subCategory,
      courseName: r.courseName,
      level: r.level,
      ageGroup: r.ageGroup,
      date: r.date,
      endDate: r.endDate, // ✅ NEW
      startTime: r.startTime,
      endTime: this.addOneHour(this.formatTimeToHHMM(r.startTime)),
      requestDate: r.requestDate,
      instructorId: r.instructorId ?? '',
      sessionLink: r.sessionLink ?? '',
      enrollmentType: '',
      enrollmentStatus: '',
    };

    this.activeSessionTab = r.sessionTab;
    this.currentPage = 1;
    this.linkError = '';

    // Since these are dummy requests, they might not have a real course ID in the dummy data,
    // but if they did, we would call fetchInstructors here.
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
      this.openModal('Error', 'Please select instructor and add a valid session link.');
      return;
    }

    this.isLoading = true;
    const payload = {
      enrollmentId: this.enrollmentId || this.requestId, // fallback to requestId if enrollmentId not found
      instructorId: this.form.instructorId,
      sessionDate: this.form.date,
      startTime: this.form.startTime,
      endTime: this.form.endTime,
      sessionLink: this.form.sessionLink.trim(),
      sessionNumber: 1, // Default or derived
      totalSessions: 1, // Default or derived
      notes: "Scheduled via Admin Panel"
    };

    this.courseSessionService.createSession(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.openModal('Success', 'Live session scheduled successfully.');
          // Optionally navigate back or refresh data
        } else {
          this.openModal('Error', res.message || 'Failed to schedule session.');
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to schedule session', err);
        const msg = err?.error?.message || 'Failed to schedule session. Please try again.';
        this.openModal('Error', msg);
        this.isLoading = false;
      }
    });
  }

  openModal(title: 'Success' | 'Error', message: string) {
    this.statusModal = {
      show: true,
      title: title,
      message: message,
      type: title
    };
  }

  closeStatusModal() {
    this.statusModal.show = false;
    if (this.statusModal.type === 'Success') {
      this.goBack();
    }
  }

  private formatDateToYYYYMMDD(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatTimeToHHMM(timeStr: string): string {
    if (!timeStr) return '';
    const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
      if (/^\d{2}:\d{2}$/.test(timeStr.trim())) return timeStr.trim();
      return timeStr;
    }

    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  private addOneHour(timeStr: string): string {
    if (!timeStr || !timeStr.includes(':')) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeStr;

    let newHours = hours + 1;
    if (newHours >= 24) newHours = 0; // Wrap around for midnight cases

    return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}

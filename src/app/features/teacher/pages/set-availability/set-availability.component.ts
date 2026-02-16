import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  InstructorAvailabilityService,
  CreateSlotRequest,
} from '../../../../core/services/teacher/availability-services/instructor-availability.service';

import {
  DayCode,
  GetMyAvailabilityResponse,
  InstructorAvailabilitySlot,
} from '../../../../core/interfaces/teacher/availability/instructor-availability';

type DayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

interface StatCard {
  label: string;
  value: string | number;
  iconPath: string;
}

interface TimeSlotForm {
  sessionTitle: string;
  scheduleType: 'Recurring Weekly' | 'Specific Date' | 'Date Range';
  days: Record<DayId, boolean>;
  startTime: string;
  endTime: string;
}

interface AvailabilitySlotUI {
  id: string;
  title: string;
  scheduleType: string;
  days: DayId[];
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-set-availability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './set-availability.component.html',
})
export class SetAvailabilityComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(private instructorAvailabilityService: InstructorAvailabilityService) {}

  // UI states
  // add these states at top with other states
isDeleting = false;
deleteError = '';
deleteSuccess = '';

  isModalOpen = false;

  isLoading = false;
  loadError = '';

  isSubmitting = false;
  submitError = '';
  submitSuccess = '';

  // if you want edit UX
  editingSlotId: string | null = null;

  private apiSlots: InstructorAvailabilitySlot[] = [];
  private apiSummary: GetMyAvailabilityResponse['summary'] | null = null;

  breadcrumb = {
    left: 'Dashboard',
    current: 'Notifications',
  };

  daysOfWeek: { id: DayId; label: string; full: string; code: DayCode }[] = [
    { id: 'mon', label: 'MON', full: 'Monday', code: 'MON' },
    { id: 'tue', label: 'TUE', full: 'Tuesday', code: 'TUE' },
    { id: 'wed', label: 'WED', full: 'Wednesday', code: 'WED' },
    { id: 'thu', label: 'THU', full: 'Thursday', code: 'THU' },
    { id: 'fri', label: 'FRI', full: 'Friday', code: 'FRI' },
    { id: 'sat', label: 'SAT', full: 'Saturday', code: 'SAT' },
    { id: 'sun', label: 'SUN', full: 'Sunday', code: 'SUN' },
  ];

  timeSlotForm: TimeSlotForm = {
    sessionTitle: '',
    scheduleType: 'Recurring Weekly',
    days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
    startTime: '',
    endTime: '',
  };

  slots: AvailabilitySlotUI[] = [];

  ngOnInit(): void {
    this.fetchMySlots();
  }

  // =======================
  // GET
  // =======================
  private fetchMySlots(): void {
    this.isLoading = true;
    this.loadError = '';

    this.instructorAvailabilityService
      .getMySlots()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (res: GetMyAvailabilityResponse) => {
          if (!res?.success) {
            this.loadError = res?.message || 'Unable to load availability.';
            this.apiSlots = [];
            this.apiSummary = null;
            this.slots = [];
            return;
          }

          const data = Array.isArray(res.data) ? res.data : [];
          this.apiSlots = data;
          this.apiSummary = res.summary || null;

          const active = data.filter((s) => !!s?.isActive);

          this.slots = active.map((s) => ({
            id: s._id,
            title: s.sessionTitle || '—',
            scheduleType: s.scheduleType || '—',
            days: this.mapApiDaysToUiDays(s.days),
            startTime: s.startTime || '',
            endTime: s.endTime || '',
          }));
        },
        error: (err) => {
          this.loadError = err?.error?.message || err?.message || 'Something went wrong.';
          this.apiSlots = [];
          this.apiSummary = null;
          this.slots = [];
        },
      });
  }

  private mapApiDaysToUiDays(days: DayCode[] | undefined): DayId[] {
    const list = Array.isArray(days) ? days : [];
    const map: Record<DayCode, DayId> = {
      MON: 'mon',
      TUE: 'tue',
      WED: 'wed',
      THU: 'thu',
      FRI: 'fri',
      SAT: 'sat',
      SUN: 'sun',
    };
    return list.map((d) => map[d]).filter(Boolean);
  }

  private mapUiDaysToApiDays(days: DayId[]): DayCode[] {
    const map: Record<DayId, DayCode> = {
      mon: 'MON',
      tue: 'TUE',
      wed: 'WED',
      thu: 'THU',
      fri: 'FRI',
      sat: 'SAT',
      sun: 'SUN',
    };
    return days.map((d) => map[d]).filter(Boolean);
  }

  // =======================
  // MODAL
  // =======================
  openModal(): void {
    this.submitError = '';
    this.submitSuccess = '';
    this.editingSlotId = null;
    this.isModalOpen = true;
    this.resetForm();
  }

  closeModal(): void {
    if (this.isSubmitting) return;
    this.isModalOpen = false;
  }

  private resetForm(): void {
    this.timeSlotForm = {
      sessionTitle: '',
      scheduleType: 'Recurring Weekly',
      days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
      startTime: '',
      endTime: '',
    };
  }

  // =======================
  // POST createSlot
  // =======================
 submitTimeSlot(): void {
  this.submitError = '';
  this.submitSuccess = '';

  const selectedDays = (Object.keys(this.timeSlotForm.days) as DayId[]).filter(
    (d) => this.timeSlotForm.days[d]
  );

  if (!this.timeSlotForm.sessionTitle.trim()) {
    this.submitError = 'Session title required';
    return;
  }
  if (!selectedDays.length) {
    this.submitError = 'Select at least 1 day';
    return;
  }
  if (!this.timeSlotForm.startTime || !this.timeSlotForm.endTime) {
    this.submitError = 'Start/End time required';
    return;
  }

  const [sh, sm] = this.timeSlotForm.startTime.split(':').map(Number);
  const [eh, em] = this.timeSlotForm.endTime.split(':').map(Number);
  if ((eh * 60 + em) <= (sh * 60 + sm)) {
    this.submitError = 'End time must be after start time';
    return;
  }

  const payload: CreateSlotRequest = {
    sessionTitle: this.timeSlotForm.sessionTitle.trim(),
    scheduleType: this.timeSlotForm.scheduleType,
    days: this.mapUiDaysToApiDays(selectedDays),
    startTime: this.timeSlotForm.startTime,
    endTime: this.timeSlotForm.endTime,
  };

  this.isSubmitting = true;

  const request$ = this.editingSlotId
    ? this.instructorAvailabilityService.updateSlot(this.editingSlotId, payload) // ✅ UPDATE
    : this.instructorAvailabilityService.createSlot(payload);                    // ✅ CREATE

  request$
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => (this.isSubmitting = false))
    )
    .subscribe({
      next: (res) => {
        if (!res?.success) {
          this.submitError = res?.message || (this.editingSlotId ? 'Unable to update slot.' : 'Unable to create slot.');
          return;
        }

        this.submitSuccess = res?.message || (this.editingSlotId ? 'Time slot updated successfully' : 'Time slot created successfully');

        // ✅ refresh list + stats
        this.fetchMySlots();

        // ✅ close + reset
        this.closeModal();
        this.resetForm();
        this.editingSlotId = null;
      },
      error: (err) => {
        this.submitError = err?.error?.message || err?.message || 'Something went wrong.';
      },
    });
}


  // =======================
  // EDIT / DELETE (UI only)
  // =======================
editSlot(slot: AvailabilitySlotUI): void {
  this.submitError = '';
  this.submitSuccess = '';
  this.editingSlotId = slot.id;

  this.timeSlotForm.sessionTitle = slot.title;
  this.timeSlotForm.scheduleType = (slot.scheduleType as any) || 'Recurring Weekly';
  this.timeSlotForm.startTime = slot.startTime;
  this.timeSlotForm.endTime = slot.endTime;

  (Object.keys(this.timeSlotForm.days) as DayId[]).forEach((d) => {
    this.timeSlotForm.days[d] = slot.days.includes(d);
  });

  this.isModalOpen = true;
}


 deleteSlot(id: string): void {
  if (!id) return;

  // optional confirm
  const ok = confirm('Are you sure you want to delete this time slot?');
  if (!ok) return;

  this.deleteError = '';
  this.deleteSuccess = '';
  this.isDeleting = true;

  this.instructorAvailabilityService
    .deleteSlot(id)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => (this.isDeleting = false))
    )
    .subscribe({
      next: (res) => {
        if (!res?.success) {
          this.deleteError = res?.message || 'Unable to delete slot.';
          return;
        }

        this.deleteSuccess = res?.message || 'Time slot deleted successfully';

        // ✅ Best: refresh from GET (summary/cards also update)
        this.fetchMySlots();
      },
      error: (err) => {
        this.deleteError = err?.error?.message || err?.message || 'Something went wrong while deleting slot.';
      },
    });
}

  // =======================
  // Helpers
  // =======================
  formatTime12(t: string): string {
    if (!t || !t.includes(':')) return '';
    const [hh, mm] = t.split(':').map(Number);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    let hour = hh % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${String(mm).padStart(2, '0')} ${ampm}`;
  }

  timeRange(start: string, end: string): string {
    const s = this.formatTime12(start);
    const e = this.formatTime12(end);
    if (!s || !e) return '—';
    return `${s} - ${e}`;
  }

  private slotDurationHours(slot: AvailabilitySlotUI): number {
    const [sh, sm] = slot.startTime.split(':').map(Number);
    const [eh, em] = slot.endTime.split(':').map(Number);
    if ([sh, sm, eh, em].some((x) => Number.isNaN(x))) return 0;
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    return Math.max(0, endMin - startMin) / 60;
  }

  get totalHoursText(): string {
    // duration * how many days selected (weekly)
    const total = this.slots.reduce(
      (sum, s) => sum + this.slotDurationHours(s) * (s.days?.length || 0),
      0
    );
    if (!total) return '0';
    return `${Math.round(total)} h`;
  }

  get totalDays(): number {
    const set = new Set<DayId>();
    this.slots.forEach((s) => (s.days || []).forEach((d) => set.add(d)));
    return set.size;
  }

  get totalWeeks(): number {
    const apiWeeks = this.apiSummary?.totalWeeks;
    if (typeof apiWeeks === 'number') return apiWeeks;
    return this.totalDays > 0 ? 1 : 0;
  }

  get totalSlots(): number {
    const apiTotal = this.apiSummary?.totalTimeSlots;
    if (typeof apiTotal === 'number') return apiTotal;
    return this.slots.length;
  }

  get statCards(): StatCard[] {
    return [
      { label: 'Total Time Slots', value: this.totalSlots, iconPath: '/assets/instructor-images/availability/calender.svg' },
      { label: 'Total Hours', value: this.totalHoursText, iconPath: '/assets/instructor-images/availability/Group.svg' },
      { label: 'Total Days', value: this.totalDays, iconPath: '/assets/instructor-images/availability/Group.svg' },
      { label: 'Total Weeks', value: this.totalWeeks, iconPath: '/assets/instructor-images/availability/Group.svg' },
    ];
  }

  slotForDay(day: DayId): AvailabilitySlotUI | null {
    return this.slots.find((s) => (s.days || []).includes(day)) ?? null;
  }

  dayLabelShort(d: DayId): string {
    const map: Record<DayId, string> = {
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      sun: 'Sun',
    };
    return map[d];
  }

  goBack(): void {
    history.back();
  }
}

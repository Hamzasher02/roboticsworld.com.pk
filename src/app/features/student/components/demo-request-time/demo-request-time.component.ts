import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CommonModule, DatePipe } from '@angular/common';
import { DemoSessionService } from '../../../../core/services/student/demo-session/demo-session.service';
import { CreateDemoSessionRequest } from '../../../../core/interfaces/student/demo-session/demo-session.interface';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-demo-request-time',
  standalone: true,
  imports: [RouterLink, CommonModule, DatePipe],
  templateUrl: './demo-request-time.component.html',
  styleUrl: './demo-request-time.component.css'
})
export class DemoRequestTimeComponent implements OnInit {
  showCalendar = false;
  selectedDate: Date = new Date(); // Default to today
  currentMonth: Date = new Date(); // Start at current month
  calendarDays: Date[] = [];
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  courseId: string | null = null;
  // Initialize course object to prevent template errors before data load, or if not loading course detail
  course: any = { _id: '' };
  selectedTime: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private demoSessionService: DemoSessionService,
    private enrollmentService: EnrollmentService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.generateCalendar();
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
      console.log('DemoRequestTimeComponent initialized with Course ID:', this.courseId);
      if (this.courseId) {
        this.course._id = this.courseId;
      }
    });
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Adjust for Monday start (0=Sun, 1=Mon...6=Sat)
    // We want Mon=0, Sun=6. JS getDay(): Sun=0, Mon=1...
    let startDayDetails = firstDay.getDay();
    // Convert to Mon-based index: Sun(0)->6, Mon(1)->0, Tue(2)->1...
    let startingDayIndex = (startDayDetails === 0 ? 6 : startDayDetails - 1);

    const matchDate = new Date(year, month, 1);
    matchDate.setDate(matchDate.getDate() - startingDayIndex);

    this.calendarDays = [];
    // 6 weeks * 7 days = 42 days grid
    for (let i = 0; i < 42; i++) {
      this.calendarDays.push(new Date(matchDate));
      matchDate.setDate(matchDate.getDate() + 1);
    }
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(date: Date) {
    if (this.isPastDate(date)) return;
    this.selectedDate = date;
    // this.showCalendar = false; // Optional: close on select
  }

  isSelected(date: Date): boolean {
    return date.getDate() === this.selectedDate.getDate() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getFullYear() === this.selectedDate.getFullYear();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth();
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  onTimeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedTime = input.value;
  }

  // Modal Logic
  showConfirmationModal = false;
  showSuccessModal = false;

  openConfirmationModal() {
    if (this.selectedDate && this.selectedTime && this.courseId) {
      this.showConfirmationModal = true;
    }
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  confirmBooking() {
    if (!this.courseId || !this.selectedDate || !this.selectedTime) return;

    // Check enrollment status first
    this.enrollmentService.checkEnrollmentStatus(this.courseId).subscribe({
      next: (res) => {
        if (res.isEnrolled || (res.enrollment && res.enrollment.enrollmentStatus === 'approved')) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'You are already enrolled in this course.' });
          this.closeConfirmationModal();
          return;
        }

        const payload: CreateDemoSessionRequest = {
          courseId: this.courseId!,
          preferredDate: this.selectedDate.toISOString(),
          preferredTime: this.selectedTime!
        };

        this.demoSessionService.createDemoRequest(payload).subscribe({
          next: (response) => {
            this.closeConfirmationModal();
            this.showSuccessModal = true;
          },
          error: (err) => {
            console.error('Demo request failed', err);
            const msg = err?.error?.message || err?.message || 'Demo request failed';
            this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
            this.closeConfirmationModal();
          }
        });
      },
      error: (err) => {
        console.error('Failed to check enrollment status', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to verify enrollment status. Please try again.' });
        this.closeConfirmationModal();
      }
    });
  }
}


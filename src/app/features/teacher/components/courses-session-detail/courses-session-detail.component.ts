/* =========================================
   courses-session-detail.component.ts (COMPLETE)
   - Contains BOTH designs:
     - variant="demo": show small section only (no Course Schedule)
     - variant="live": show Course Schedule + big layout (same as dashboard live modal)
   ========================================= */

import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../core/services/toast/toast.service';

export type SessionDetail = {
  sessionId: string;
  type: string;
  course: string;
  level: string;
  date: string;
  time: string;

  student: {
    name: string;
    email: string;
    grade: string;
    age: string;
    learningPreferences: string;
  };

  meetingLink?: string;

  // ✅ Live-only
  courseSchedule?: {
    courseStartDate?: string;
    sessionFrequency?: string;
    progressText?: string;
    firstSession?: string;
    fixedTimeSlot?: string;
    module?: string;
  };
};

@Component({
  selector: 'app-courses-session-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses-session-detail.component.html',
  styleUrl: './courses-session-detail.component.css',
})
export class CoursesSessionDetailComponent {
  private readonly toast = inject(ToastService);
  @Input() isOpen = false;
  @Input() data: SessionDetail | null = null;

  // ✅ NEW: switch design
  @Input() variant: 'demo' | 'live' = 'demo';

  @Output() close = new EventEmitter<void>();
  @Output() join = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onJoin() {
    this.join.emit();
  }

  copyLink() {
    const link = this.data?.meetingLink;
    if (!link) return;
    navigator.clipboard.writeText(link);
    this.toast.success('Meeting link copied!');
  }

  openMeeting() {
    const link = this.data?.meetingLink;
    if (!link) return;
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  addToCalendar() {
    this.toast.info('Add to Calendar clicked!');
  }
}

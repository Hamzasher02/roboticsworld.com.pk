import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Session } from '../../../../core/interfaces/models/session.model';
import { ToastService } from '../../../../core/services/toast/toast.service';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-detail.component.html',
  styleUrls: ['./session-detail.component.css'],
})
export class SessionDetailComponent {
  private readonly toast = inject(ToastService);
  @Input() session: Session | null = null;
  @Input() isOpen = false;

  // ✅ NEW
  @Input() loading = false;
  @Input() error = '';

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

  // ---------- Safe view-model getters (NO "as any" in template) ----------
  private get vm(): any {
    return this.session ?? {};
  }

  get vmStudentName(): string {
    return this.vm.studentName ?? this.vm.student ?? '—';
  }

  get vmCourseName(): string {
    return this.vm.courseName ?? this.vm.course ?? '—';
  }

  get vmModuleName(): string {
    return this.vm.moduleName ?? this.vm.module ?? '—';
  }

  get vmDate(): string {
    return this.vm.date ?? '—';
  }

  get vmTime(): string {
    return this.vm.time ?? '—';
  }

  get vmMeetingLink(): string {
    return this.vm.meetingLink ?? this.vm.sessionLink ?? '';
  }

  get vmTotalSessions(): number {
    const t = Number(this.vm.totalSessions ?? 0);
    return isNaN(t) ? 0 : t;
  }

  get vmSessionNumberRaw(): any {
    return this.vm.sessionNumber ?? this.vm.sessionText ?? '';
  }

  /** Robust parse: handles 2, "2 of 12", "2/12", etc. */
  get currentSessionNumber(): number {
    const raw = this.vmSessionNumberRaw ?? '';
    const match = String(raw).match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  get progressPercent(): number {
    const total = this.vmTotalSessions;
    if (!total) return 0;
    return (this.currentSessionNumber / total) * 100;
  }

  get sessionsRemaining(): number {
    const total = this.vmTotalSessions;
    if (!total) return 0;
    return Math.max(total - this.currentSessionNumber, 0);
  }

  /** Status pill */
  get statusLabel(): string {
    const s = this.vm.status ?? this.vm.sessionStatus ?? this.vm.type;
    return s ? String(s) : 'Upcoming';
  }

  get statusPillClass(): string {
    const v = this.statusLabel.toLowerCase();
    if (v.includes('upcoming') || v.includes('scheduled')) return 'bg-red-100 text-red-600';
    if (v.includes('completed')) return 'bg-green-100 text-green-600';
    if (v.includes('cancel')) return 'bg-gray-200 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  }

  copyMeetingLink(link?: string | null) {
    if (!link) {
      this.toast.warning('No meeting link available!');
      return;
    }
    navigator.clipboard.writeText(link);
    this.toast.success('Meeting link copied!');
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivityLogService } from '../../../../core/services/admin/activity-log/activity-log.service';
import { ActivityLogItem, GetAllActivityLogsResponse } from '../../../../core/interfaces/admin/activity-log';

type Period = 'Daily' | 'Weekly' | 'Monthly';
type Range = 'Last 7 days' | 'Last 30 days' | 'Last 90 days';
type Role = 'All' | 'Admin' | 'Instructor' | 'Student';

interface ActivityRow {
  id: string;
  sn: number;
  timestamp: string;
  user: string;
  action: string;
  description: string;
  selected?: boolean;
}

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-log.component.html',
  styleUrl: './activity-log.component.css',
})
export class ActivityLogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  // header
  title = 'Activity Log';
  dateRangeText = '24 March 2023-Today'; // Ideally dynamic

  // filters
  period: Period = 'Monthly';
  search = '';
  range: Range = 'Last 7 days';
  roleFilter: Role = 'All'; // Placeholder

  // Action filter
  actionFilter: string = 'All';
  actionOptions: string[] = ['All']; // Dynamic options

  // pagination
  page = 1;
  pageSize = 10;
  totalPages = 1;
  totalRecords = 0;
  isLoading = false;

  rows: ActivityRow[] = [];

  constructor(private activityService: ActivityLogService) {
    // Debounce search
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((term: string) => {
      this.search = term;
      this.page = 1;
      this.loadLogs();
    });
  }

  ngOnInit(): void {
    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Called by input event
  onSearchChange(val: string): void {
    this.searchSubject.next(val);
  }

  loadLogs(): void {
    this.isLoading = true;
    const { startDate, endDate, startObj, endObj } = this.getDateRange();

    // Update date text
    this.dateRangeText = `${startObj.toLocaleDateString()} - ${endObj.toLocaleDateString()}`;

    this.activityService.getAllActivityLogs(this.page, this.pageSize, this.search, this.actionFilter, startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: GetAllActivityLogsResponse) => {
          this.isLoading = false;
          if (res.success) {
            this.rows = (res.data ?? []).map((log: ActivityLogItem, index: number) => this.mapLogToRow(log, index));
            this.totalPages = res.pagination.totalPages;
            this.totalRecords = res.pagination.totalRecords;
            this.page = res.pagination.currentPage;

            // Collect dynamic action options
            this.updateActionOptions(res.data);
          } else {
            this.rows = [];
            console.error(res.message);
          }
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.rows = [];
          const msg = this.getErrorMessage(err);
          console.error(msg);
        }
      });
  }

  private getErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      return err.error?.message || err.message || 'Server Error';
    }
    if (err instanceof Error) {
      return err.message;
    }
    return String(err);
  }

  private updateActionOptions(data: ActivityLogItem[]): void {
    const existing = new Set(this.actionOptions);
    (data || []).forEach((item: ActivityLogItem) => {
      if (item.actionType && !existing.has(item.actionType)) {
        existing.add(item.actionType);
      }
    });
    // Sort and ensure All is first
    this.actionOptions = Array.from(existing).sort();
    if (this.actionOptions.includes('All')) {
      this.actionOptions = ['All', ...this.actionOptions.filter((x: string) => x !== 'All')];
    }
  }

  private getDateRange(): { startDate?: string; endDate?: string; startObj: Date; endObj: Date } {
    const end = new Date();
    let start = new Date();

    if (this.range === 'Last 7 days') {
      start.setDate(end.getDate() - 7);
    } else if (this.range === 'Last 30 days') {
      start.setDate(end.getDate() - 30);
    } else if (this.range === 'Last 90 days') {
      start.setDate(end.getDate() - 90);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      startObj: start,
      endObj: end
    };
  }

  mapLogToRow(log: ActivityLogItem, index: number): ActivityRow {
    // Format timestamp if needed
    let timeStr = log.createdAt;
    try {
      timeStr = new Date(log.createdAt).toLocaleString();
    } catch { }

    const safeVal = (v: string | null | undefined): string => (v === null || v === undefined ? 'null' : v);

    return {
      id: log._id,
      sn: (this.page - 1) * this.pageSize + (index + 1),
      timestamp: timeStr,
      user: safeVal(log.email || log.name),
      action: safeVal(log.actionType),
      description: safeVal(log.actionDescription || log.sessionStatus),
      selected: false
    };
  }

  trackById(_: number, r: ActivityRow): string {
    return r.id;
  }

  // Use rows directly since pagination is server-side
  get pagedRows(): ActivityRow[] {
    return this.rows;
  }

  get allOnPageSelected(): boolean {
    const p = this.rows;
    return p.length > 0 && p.every((x) => !!x.selected);
  }

  toggleSelectAllOnPage(checked: boolean): void {
    this.rows.forEach((x) => (x.selected = checked));
  }

  applyFilter(): void {
    this.page = 1; // Reset to page 1
    this.loadLogs();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadLogs();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadLogs();
    }
  }

  onPeriodChange(p: Period): void {
    this.period = p;
    this.applyFilter();
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnrollmentService } from '../../../../core/services/admin/enrollment/enrollment.service';
import { Enrollment } from '../../../../core/interfaces/admin/enrollment.interface';
import { StatusModalComponent } from '../../../../shared/components/status-modal/status-modal.component';

type DateRange = 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days';
type Category = 'All Categories' | 'Design' | 'Development' | 'Marketing' | 'Data Science';
type CourseFilter = 'Courses' | 'Bundles' | 'All';
type PurchaseType = 'Type' | 'Live Classes' | 'Recorded Lectures' | string;
type Status = 'Paid' | 'Pending' | 'Failed' | 'approved' | string;

type PurchaseRow = {
  id: string;
  orderId: string;
  orderDate: string;
  orderTime: string;
  course: string;
  type: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  status: Status;
  avatarUrl?: string;
  selected?: boolean;

  studentPhone?: string;
  paymentScreenshot?: string;
  courseTypeLabel?: string;
  createdAtTimestamp?: number;
  courseCategories?: string[];
};

@Component({
  selector: 'app-manage-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent],
  templateUrl: './manage-purchase.component.html',
  styleUrl: './manage-purchase.component.css',
})
export class ManagePurchaseComponent implements OnInit {
  // modal
  detailsOpen = false;
  selectedRow: PurchaseRow | null = null;
  isLoading = false;

  statusModal = {
    show: false,
    title: '',
    message: '',
    type: 'Success' as 'Success' | 'Error'
  };

  // ✅ ONLINE fallback images (no local assets)
  defaultAvatar = 'https://i.pravatar.cc/128?img=12';
  defaultScreenshot = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=60';

  // ✅ data
  rows: PurchaseRow[] = [];

  // header
  breadcrumbLeft = 'Dashboard';
  breadcrumbRight = 'Payments';
  title = 'Manage Purchases';
  topDateText = '';

  // controls
  search = '';
  exportOpen = false;

  // filters
  dateRange: DateRange = 'Last 30 Days';
  category: Category = 'All Categories';
  courseFilter: CourseFilter = 'Courses';
  purchaseType: PurchaseType = 'Type';

  // pagination
  page = 1;
  pageSize = 10;

  constructor(private enrollmentService: EnrollmentService) {
    const d = new Date();
    this.topDateText = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  ngOnInit(): void {
    this.fetchEnrollments();
  }

  fetchEnrollments(): void {
    this.isLoading = true;
    this.enrollmentService.getAllEnrollments().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rows = res.data.map(en => this.mapEnrollmentToRow(en));
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch enrollments', err);
        this.isLoading = false;
      }
    });
  }

  mapEnrollmentToRow(en: Enrollment): PurchaseRow {
    const dateObj = new Date(en.createdAt);
    return {
      id: en._id,
      orderId: en.invoiceNumber || 'N/A',
      orderDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      orderTime: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      course: en.course?.courseTitle || 'Unknown Course',
      type: en.enrollmentType || 'Unknown',
      studentName: `${en.user?.firstName || ''} ${en.user?.lastName || ''}`.trim() || 'Unknown User',
      studentEmail: en.user?.email || '',
      amount: parseFloat(en.course?.coursePrice || '0'),
      status: en.enrollmentStatus === 'approved' ? 'Paid' : this.capitalize(en.enrollmentStatus) || 'Pending',
      avatarUrl: en.user?.profilePicture?.secureUrl || this.defaultAvatar,
      studentPhone: en.user?.phoneNumber || '',
      paymentScreenshot: en.paymentScreenshot?.secureUrl || this.defaultScreenshot,
      courseTypeLabel: en.enrollmentType || 'Unknown',
      createdAtTimestamp: new Date(en.createdAt).getTime(),
      courseCategories: en.course?.courseCategory || [],
      selected: false
    };
  }

  private capitalize(s: string): string {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // -----------------------------
  // ✅ Pagination FIX (clamp page)
  // -----------------------------
  private clampPage(): void {
    const tp = this.totalPages;
    if (this.page > tp) this.page = tp;
    if (this.page < 1) this.page = 1;
  }

  trackById(_: number, r: PurchaseRow): string {
    return r.id;
  }

  // images
  getAvatar(r: PurchaseRow): string {
    return r.avatarUrl && r.avatarUrl.trim() ? r.avatarUrl : this.defaultAvatar;
  }

  getScreenshot(r: PurchaseRow | null): string {
    if (!r) return this.defaultScreenshot;
    return r.paymentScreenshot && r.paymentScreenshot.trim() ? r.paymentScreenshot : this.defaultScreenshot;
  }

  // modal
  openDetails(row: PurchaseRow): void {
    if (!row.id) return;
    this.isLoading = true;
    this.enrollmentService.getSingleEnrollment(row.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Merge API data with row data or just map it fresh
          const en = res.data;
          this.selectedRow = {
            ...row,
            orderId: en.invoiceNumber || row.orderId,
            studentPhone: en.user?.phoneNumber || row.studentPhone || 'N/A',
            paymentScreenshot: en.paymentScreenshot?.secureUrl || row.paymentScreenshot || this.defaultScreenshot,
            courseTypeLabel: en.enrollmentType || row.courseTypeLabel,
          };
          this.detailsOpen = true;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch single enrollment', err);
        // Fallback to row data if API fails? Or show error?
        // For now, let's just open with what we have + error log
        this.selectedRow = { ...row };
        this.detailsOpen = true;
        this.isLoading = false;
      }
    });
  }

  closeDetails(): void {
    this.detailsOpen = false;
    this.selectedRow = null;
  }

  approveSelected(): void {
    if (!this.selectedRow?.id) return;

    this.isLoading = true;
    this.enrollmentService.updateEnrollmentStatus(this.selectedRow.id, 'approved').subscribe({
      next: (res) => {
        if (res.success) {
          this.openModal('Success', 'Enrollment approved successfully');
          // Re-fetch list to update UI
          this.fetchEnrollments();
          this.closeDetails();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to approve enrollment', err);
        const msg = err?.error?.message || 'Failed to approve enrollment';
        this.openModal('Error', msg);
        this.isLoading = false;
      }
    });
  }

  openModal(type: 'Success' | 'Error', message: string): void {
    this.statusModal = {
      show: true,
      title: type === 'Success' ? 'Success' : 'Error',
      message: message,
      type: type
    };
  }

  closeStatusModal(): void {
    this.statusModal.show = false;
  }

  // derived
  get filteredRows(): PurchaseRow[] {
    let list = [...this.rows];
    const q = this.search.trim().toLowerCase();

    // Search filter
    if (q) {
      list = list.filter((r) =>
        [
          r.orderId,
          r.orderDate,
          r.orderTime,
          r.course,
          r.type,
          r.studentName,
          r.studentEmail,
          r.status,
          r.amount.toString(),
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    // Date Range filter
    if (this.dateRange !== 'Last 30 Days') {
      const now = Date.now();
      let daysBack = 30;

      if (this.dateRange === 'Last 7 Days') daysBack = 7;
      else if (this.dateRange === 'Last 90 Days') daysBack = 90;

      const cutoffTime = now - (daysBack * 24 * 60 * 60 * 1000);
      list = list.filter((r) => {
        const timestamp = r.createdAtTimestamp || 0;
        return timestamp >= cutoffTime;
      });
    }

    // Category filter
    if (this.category !== 'All Categories') {
      list = list.filter((r) => {
        const categories = r.courseCategories || [];
        return categories.some(cat => cat.toLowerCase() === this.category.toLowerCase());
      });
    }

    // Course/Bundle filter (if we can distinguish them - for now we'll skip this as enrollmentType doesn't distinguish courses vs bundles)
    // This would need backend support to distinguish between course and bundle enrollments
    if (this.courseFilter !== 'Courses' && this.courseFilter !== 'All') {
      // If "Bundles" is selected and we have a way to identify them, filter here
      // For now, we'll leave this as-is since we don't have bundle distinction in the data
    }

    // Type filter (Live Sessions, Rec Lectures, etc.)
    if (this.purchaseType !== 'Type') {
      list = list.filter((r) => r.type.toLowerCase() === this.purchaseType.toLowerCase());
    }

    return list;
  }

  get totalPages(): number {
    const total = Math.ceil(this.filteredRows.length / this.pageSize);
    return total <= 0 ? 1 : total;
  }

  get pagedRows(): PurchaseRow[] {
    this.clampPage(); // ✅ always keep page valid
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get selectedCount(): number {
    return this.rows.filter((r) => r.selected).length;
  }

  get allOnPageSelected(): boolean {
    const p = this.pagedRows;
    return p.length > 0 && p.every((x) => !!x.selected);
  }

  toggleSelectAllOnPage(checked: boolean): void {
    this.pagedRows.forEach((x) => (x.selected = checked));
  }

  // ✅ IMPORTANT: when filters/search change -> page=1 then clamp
  applyFilters(): void {
    this.page = 1;
    this.exportOpen = false;
    this.clampPage();
  }

  resetFilters(): void {
    this.search = '';
    this.dateRange = 'Last 30 Days';
    this.category = 'All Categories';
    this.courseFilter = 'Courses';
    this.purchaseType = 'Type';
    this.page = 1;
    this.exportOpen = false;
    this.clampPage();
    this.fetchEnrollments();
  }

  toggleExport(): void {
    this.exportOpen = !this.exportOpen;
  }

  exportAs(kind: 'CSV' | 'XLSX' | 'PDF'): void {
    this.exportOpen = false;

    if (kind === 'CSV') {
      const headers = ['Order ID', 'Date', 'Time', 'Course', 'Student Name', 'Student Email', 'Amount', 'Status'];
      const rows = this.filteredRows.map(r => [
        r.orderId,
        r.orderDate,
        r.orderTime,
        `"${r.course.replace(/"/g, '""')}"`, // Handle commas/quotes
        r.studentName,
        r.studentEmail,
        r.amount,
        r.status
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      this.openModal('Error', `${kind} export is not yet implemented. Please use CSV.`);
    }
  }

  prevPage(): void {
    this.page = Math.max(1, this.page - 1);
    this.clampPage();
  }

  nextPage(): void {
    this.page = Math.min(this.totalPages, this.page + 1);
    this.clampPage();
  }

  get showingText(): string {
    const total = this.filteredRows.length;
    this.clampPage();
    const from = total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
    const to = Math.min(total, this.page * this.pageSize);
    return `Showing ${from}-${to} of ${total} transactions`;
  }
}

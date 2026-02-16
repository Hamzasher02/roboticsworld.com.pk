import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';
import { EnrollmentService } from '../../../../core/services/admin/enrollment/enrollment.service';
import { Enrollment } from '../../../../core/interfaces/admin/enrollment.interface';

type PaymentRow = {
  id: string;
  date: string;
  course: string;
  studentName: string;
  studentAvatar: string;
  amount: string;
  status: string;
};

@Component({
  selector: 'app-payment-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-overview.component.html',
  styleUrl: './payment-overview.component.css',
})
export class PaymentOverviewComponent implements OnInit {
  constructor(
    private router: Router,
    private enrollmentService: EnrollmentService
  ) { }

  totalTransactions = '$0';
  totalTransactionsDelta = '+0% this month';

  pendingPayments = '$0';
  pendingTransactionsCount = '0 transactions';

  rows: PaymentRow[] = [];
  rawEnrollments: Enrollment[] = [];

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.enrollmentService.getAllEnrollments().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rawEnrollments = res.data;
          this.calculateStats(res.data);
          // Show recent 4 rows for overview
          this.rows = res.data
            .slice(0, 4)
            .map(en => this.mapToRow(en));
        }
      },
      error: (err) => console.error('Failed to fetch enrollment data', err)
    });
  }

  private mapToRow(en: Enrollment): PaymentRow {
    const d = new Date(en.createdAt);
    return {
      id: en.invoiceNumber || en._id.slice(-8).toUpperCase(),
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      course: en.course?.courseTitle || 'N/A',
      studentName: `${en.user?.firstName || ''} ${en.user?.lastName || ''}`.trim() || 'Student',
      studentAvatar: en.user?.profilePicture?.secureUrl || 'https://i.pravatar.cc/128?img=12',
      amount: `$${parseFloat(en.course?.coursePrice || '0').toLocaleString()}`,
      status: en.enrollmentStatus === 'approved' ? 'Completed' : 'Pending'
    };
  }

  private calculateStats(data: Enrollment[]): void {
    let approvedSum = 0;
    let pendingSum = 0;
    let pendingCount = 0;

    data.forEach(en => {
      const price = parseFloat(en.course?.coursePrice || '0');
      if (en.enrollmentStatus === 'approved') {
        approvedSum += price;
      } else if (en.enrollmentStatus === 'pending') {
        pendingSum += price;
        pendingCount++;
      }
    });

    this.totalTransactions = `$${approvedSum.toLocaleString()}`;
    this.pendingPayments = `$${pendingSum.toLocaleString()}`;
    this.pendingTransactionsCount = `${pendingCount} transactions`;

    // Mock delta for now since we don't have historical data in this API
    this.totalTransactionsDelta = '+7.2% this month';
  }

  trackById(_: number, item: PaymentRow) {
    return item.id;
  }

  statusPill(status: string) {
    return status === 'Completed'
      ? 'bg-[#DCFCE7] text-[#166534]'
      : 'bg-[#FEF3C7] text-[#92400E]';
  }

  onExport() {
    if (this.rawEnrollments.length === 0) return;

    const headers = ['Transaction ID', 'Date', 'Course', 'Student Name', 'Amount', 'Status'];
    const csvRows = this.rawEnrollments.map(en => {
      const d = new Date(en.createdAt);
      return [
        en.invoiceNumber || en._id,
        d.toLocaleDateString(),
        `"${en.course?.courseTitle?.replace(/"/g, '""') || 'N/A'}"`,
        `"${en.user?.firstName || ''} ${en.user?.lastName || ''}"`,
        en.course?.coursePrice || '0',
        en.enrollmentStatus
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment_overview_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  viewAll() {
    this.router.navigate([`${getAdminBasePath()}/manage-purchases`]);
  }
}

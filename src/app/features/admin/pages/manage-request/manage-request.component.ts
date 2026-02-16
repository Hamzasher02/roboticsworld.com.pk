import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DemoSessionComponent } from '../../components/manage-session/demo-session/demo-session.component';
import { CourseSessionService } from '../../../../core/services/admin/course-session/course-session.service';
import { DemoSessionService } from '../../../../core/services/admin/demo-session/demo-session.service';
import { NameChangeService } from '../../../../core/services/admin/name-change/name-change.service';
import { Router } from '@angular/router';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';
import { CirtificateComponent } from "../../components/manage-session/cirtificate/cirtificate.component";
import { StatusModalComponent } from "../../../../shared/components/status-modal/status-modal.component";

type TabKey = 'demo' | 'live' | 'name';
type Status = 'Pending' | 'Rejected' | 'Approved';
type ProcessedStatus = 'Approved' | 'Rejected';

type SelectOpt = { value: string; label: string };

type RequestRow = {
  id: string;
  avatar: string;
  name: string;
  email: string;
  course: string;
  preferredTime: string;
  requestDate: string;
  status: Status;
};

type NameChangeRow = {
  id: string;
  avatar: string;
  name: string;
  email: string;
  currentName: string;
  requestedName: string;
  requestDate: string;
  status: Status;
};

type ProcessedRow = {
  id: string;
  name: string;
  email: string;
  course: string;
  fromName: string;
  toName: string;
  processedDate: string;
  status: ProcessedStatus;
};

@Component({
  selector: 'app-manage-request',
  standalone: true,
  imports: [FormsModule, CommonModule, CirtificateComponent, StatusModalComponent],
  templateUrl: './manage-request.component.html',
  styleUrl: './manage-request.component.css',
})
export class ManageRequestComponent implements OnInit {
  constructor(
    private router: Router,
    private courseSessionService: CourseSessionService,
    private demoSessionService: DemoSessionService,
    private nameChangeService: NameChangeService
  ) { }
  private basePath = getAdminBasePath();
  activeTab: TabKey = 'demo';

  statusModal = {
    show: false,
    title: '' as 'Success' | 'Error',
    message: '',
    type: 'Success' as 'Success' | 'Error'
  };

  openModal(title: 'Success' | 'Error', message: string) {
    this.statusModal = {
      show: true,
      title: title,
      message: message,
      type: title
    };
  }

  ngOnInit() {
    this.fetchData();
  }

  // ===== Select options (fully dynamic) =====
  dateOptions: SelectOpt[] = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
  ];

  courseOptions: SelectOpt[] = [
    { value: 'all', label: 'All Courses' },
  ];

  statusOptions: SelectOpt[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  filters = { date: '7', course: 'all', status: 'all' };

  // ✅ Pagination state
  page = { current: 1, total: 1 };
  pageSize = 5;
  liveTotalItems = 0; // For server-side pagination display

  // ===== Data =====
  demoRequests: RequestRow[] = [];

  liveRequests: RequestRow[] = [];

  nameRequests: NameChangeRow[] = [];

  processedRows: ProcessedRow[] = [];

  // ===== Computed (✅ filtered + paginated) =====
  get baseRows(): RequestRow[] {
    return this.activeTab === 'live' ? this.liveRequests : this.demoRequests;
  }

  get filteredRows(): RequestRow[] {
    // If active tab is live, we are using server-side fetched data which is already filtered by API (if params supported) 
    // or just full list for now. Since API supports pagination, 'liveRequests' should contain the current page data.
    if (this.activeTab === 'live') {
      return this.liveRequests;
    }
    return this.filterRows(this.baseRows);
  }

  get viewRows(): RequestRow[] {
    if (this.activeTab === 'live') {
      // For live tab, data is already paginated from server
      return this.liveRequests;
    }

    // For other tabs (local filtering)
    const totalPages = Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
    this.page.total = totalPages;

    if (this.page.current > totalPages) this.page.current = totalPages;
    if (this.page.current < 1) this.page.current = 1;

    const start = (this.page.current - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get nameRows(): NameChangeRow[] {
    return this.nameRequests;
  }

  get startItem(): number {
    if (this.activeTab === 'live' || this.activeTab === 'name') {
      if (this.liveTotalItems === 0) return 0;
      return (this.page.current - 1) * this.pageSize + 1;
    }
    if (this.filteredRows.length === 0) return 0;
    return (this.page.current - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    if (this.activeTab === 'live' || this.activeTab === 'name') {
      const end = this.page.current * this.pageSize;
      return end > this.liveTotalItems ? this.liveTotalItems : end;
    }
    return Math.min(this.page.current * this.pageSize, this.filteredRows.length);
  }

  get canPrev(): boolean {
    return this.page.current > 1;
  }

  get canNext(): boolean {
    return this.page.current < this.page.total;
  }

  // ===== Events =====
  setTab(tab: TabKey) {
    this.activeTab = tab;
    this.page.current = 1;
    this.applyFilters();
  }

  applyFilters() {
    this.page.current = 1;
    this.fetchData();
  }

  fetchData() {
    if (this.activeTab === 'live') {
      this.courseSessionService.getAllSessions(this.page.current, this.pageSize).subscribe({
        next: (res: any) => {
          if (res.success && res.data) {
            this.liveRequests = res.data.map((enrollment: any) => ({
              id: enrollment._id,
              avatar: enrollment.user?.profilePicture?.secureUrl || 'https://i.pravatar.cc/150?img=3',
              name: `${enrollment.user?.firstName || 'Unknown'} ${enrollment.user?.lastName || ''}`.trim(),
              email: enrollment.user?.email || 'N/A',
              course: enrollment.course?.courseTitle || 'Unknown Course',
              preferredTime: enrollment.preferredClassTime || 'N/A',
              requestDate: enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : 'N/A',
              status: enrollment.isSessionAssigned ? 'Approved' : 'Pending',
              isAssigned: enrollment.isSessionAssigned
            }));

            if (res.pagination) {
              this.page.total = res.pagination.pages;
              this.liveTotalItems = res.pagination.total;
            }
          }
        },
        error: (err) => {
          console.error('Failed to fetch sessions', err);
          this.liveRequests = [];
        }
      });
    } else if (this.activeTab === 'demo') {
      this.demoSessionService.getAllDemoSessionRequests().subscribe({
        next: (res) => {
          if (res.success) {
            this.demoRequests = res.data.map(req => ({
              id: req._id,
              avatar: req.student?.profilePicture?.secureUrl || 'https://i.pravatar.cc/150?img=3',
              name: `${req.student?.firstName || 'Unknown'} ${req.student?.lastName || ''}`.trim(),
              email: req.student?.email || 'N/A',
              course: req.course?.courseTitle || 'Unknown Course',
              preferredTime: `${new Date(req.preferredDate).toLocaleDateString()} • ${req.preferredTime}`,
              requestDate: new Date(req.createdAt).toLocaleDateString(),
              status: (req.status.charAt(0).toUpperCase() + req.status.slice(1)) as Status
            } as RequestRow));
          }
        },
        error: (err) => {
          console.error('Failed to fetch demo requests', err);
          this.demoRequests = [];
        }
      });
    } else if (this.activeTab === 'name') {
      this.nameChangeService.getAllNameChangeRequests(this.page.current, this.pageSize).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.nameRequests = res.data.map((req: any) => ({
              id: req._id,
              avatar: req.createdBy?.profilePicture?.secureUrl || 'https://i.pravatar.cc/150?img=3',
              name: `${req.createdBy?.firstName || 'Unknown'} ${req.createdBy?.lastName || ''}`.trim(),
              email: req.createdBy?.email || 'N/A',
              currentName: `${req.createdBy?.firstName || 'Unknown'} ${req.createdBy?.lastName || ''}`.trim(),
              requestedName: `${req.firstName || ''} ${req.lastName || ''}`.trim(),
              requestDate: new Date(req.createdAt).toLocaleDateString(),
              status: req.isApproved ? 'Approved' : 'Pending'
            } as NameChangeRow));

            if (res.pagination) {
              this.page.total = res.pagination.totalPages;
              this.liveTotalItems = res.pagination.total;
            }
          }
        },
        error: (err) => {
          console.error('Failed to fetch name change requests', err);
          this.nameRequests = [];
        }
      });
    }
  }

  nextPage() {
    if (this.canNext) {
      this.page.current += 1;
      if (this.activeTab === 'live' || this.activeTab === 'name') {
        this.fetchData();
      }
    }
  }

  prevPage() {
    if (this.canPrev) {
      this.page.current -= 1;
      if (this.activeTab === 'live' || this.activeTab === 'name') {
        this.fetchData();
      }
    }
  }

  refresh() {
    this.applyFilters();
  }

  goBack() {
    this.router.navigate([`${this.basePath}/dashboard`]);
  }




  demoView(row: any) {
    this.router.navigate([`${this.basePath}/manage-request/demo-session`, row.id]);
  }
  liveView(row: any) {
    this.router.navigate([`${this.basePath}/manage-request/live-session`, row.id]);
  }
  showCertificatePopup = false;
  selectedRow: any = null;

  cirtificateCorrection(row: any) {
    this.selectedRow = row;
    this.showCertificatePopup = true;
  }

  closeCertificatePopup() {
    this.showCertificatePopup = false;
    this.selectedRow = null;
  }


  approveNameChange(res: any) {
    console.log('📥 Approve response received in parent:', res);
    if (res.success) {
      this.applyFilters();
      console.log('✅ Showing success toast:', res.message || 'Request approved successfully');
      this.openModal('Success', res.message || 'Request approved successfully');
    } else {
      console.log('❌ Showing error toast:', res.message || 'Failed to approve request');
      this.openModal('Error', res.message || 'Failed to approve request');
    }
  }

  rejectNameChange(res: any) {
    console.log('📥 Reject response received in parent:', res);
    if (res.success) {
      this.applyFilters();
      console.log('✅ Showing success toast:', res.message || 'Request rejected successfully');
      this.openModal('Success', res.message || 'Request rejected successfully');
    } else {
      console.log('❌ Showing error toast:', res.message || 'Failed to reject request');
      this.openModal('Error', res.message || 'Failed to reject request');
    }
  }

  reject(row: any) { }
  viewDetails(row: RequestRow) { }
  viewDetail(row: NameChangeRow) { }
  approve(row: NameChangeRow) { }
  viewProcessed(row: ProcessedRow) { }

  // ===== Helpers =====
  trackById(_: number, item: { id: string }) {
    return item.id;
  }

  statusPill(status: any) {
    if (status === 'Approved' || status === 'true') return 'bg-[#DCFCE7] text-[#16A34A]';
    if (status === 'Pending') return 'bg-[#FEF9C3] text-[#A16207]';
    return 'bg-[#FEE2E2] text-[#EF4444]'; // Rejected, false, etc
  }

  processedPill(status: ProcessedStatus) {
    return status === 'Approved' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#EF4444]';
  }



  private filterRows(rows: RequestRow[]) {
    let out = [...rows];

    if (this.filters.course !== 'all') {
      out = out.filter((r) => {
        const c = r.course.toLowerCase();
        if (this.filters.course === 'react') return c.includes('react');
        if (this.filters.course === 'advjs') return c.includes('advanced');
        return true;
      });
    }

    if (this.filters.status !== 'all') {
      const targetStatus = this.filters.status.charAt(0).toUpperCase() + this.filters.status.slice(1);
      out = out.filter((r) => r.status === targetStatus);
    }

    return out;
  }

  get showingText(): string {
    const total = this.activeTab === 'live' ? this.liveTotalItems : this.filteredRows.length;
    return `Showing ${this.startItem}-${this.endItem} of ${total}`;
  }
}


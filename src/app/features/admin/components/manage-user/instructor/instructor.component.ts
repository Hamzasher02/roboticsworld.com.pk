import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getAdminBasePath } from '../../../../../core/config/admin-routes.config';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

import { AllInstructorService } from '../../../../../core/services/admin/all-instructor/all-instructor.service';
import { CourseService } from '../../../../../core/services/admin/all-instructor/course.service';
import {
  InstructorApiItem,
  User,
  CourseMin
} from '../../../../../core/interfaces/admin/all-instructor';
import { StatusModalComponent } from '../../../../../shared/components/status-modal/status-modal.component';

@Component({
  selector: 'app-instructor',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent],
  templateUrl: './instructor.component.html',
})
export class InstructorComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  tabs = ['All', 'Active', 'Pending', 'Inactive', 'Flagged'];
  activeTab = 'All';
  users: User[] = [];

  page = 1;
  pageSize = 10;
  totalItems = 0;
  backendTotalPages = 1;
  selectAll = false;
  openedUser: User | null = null;

  searchQuery = '';
  isLoading = false;

  // --- Modal State ---
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'Success' | 'Error' = 'Success';

  constructor(
    private router: Router,
    private allInstructorService: AllInstructorService,
    private courseService: CourseService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // Use forkJoin with individual error handling to prevent complete failure
    forkJoin({
      res: this.allInstructorService.getInstructors(this.searchQuery, this.activeTab, this.page, this.pageSize),
      courses: this.courseService.getCourses().pipe(catchError(() => of([]))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ res, courses }) => {
          const { instructors, pagination } = res;
          const titleMap = this.buildCourseTitleMap(courses);

          this.users = (instructors ?? []).map((api: InstructorApiItem) => {
            return {
              name: `${api.firstName ?? ''} ${api.lastName ?? ''}`.trim() || 'Unnamed',
              email: api.email,
              course: this.makeCourseTitlesString(api.instructor?.coursePreferences ?? [], titleMap),
              status: this.mapAccountStatusToUi(api.accountStatus),
              avatar: api.profilePicture?.secureUrl ?? 'https://i.pravatar.cc/150?img=1',
              id: api._id,
              selected: false,
            };
          });

          if (pagination) {
            this.backendTotalPages = pagination.totalPages;
            this.totalItems = pagination.totalInstructors;
          }

          this.isLoading = false;
          this.selectAll = false;
        },
        error: (err) => {
          console.error('Error loading instructors', err);
          this.users = [];
          this.isLoading = false;
        },
      });
  }

  private mapAccountStatusToUi(s?: string): string {
    const v = (s ?? '').toLowerCase().trim();
    if (v === 'active') return 'Active';
    if (v === 'pending') return 'Pending';
    if (v === 'inactive') return 'Inactive';
    if (v === 'flagged') return 'Flagged';
    return 'Pending';
  }

  private buildCourseTitleMap(courses: CourseMin[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const c of courses ?? []) {
      if (c?._id) map[c._id] = c.courseTitle ?? '';
    }
    return map;
  }

  private makeCourseTitlesString(courseIds: string[], map: Record<string, string>): string {
    const titles = (courseIds ?? [])
      .map((id) => map[id])
      .filter((t) => !!t);

    if (titles.length === 0) return 'No Course Selected';
    return titles.join(', ');
  }

  // --- Filtering & Pagination ---
  get filteredUsers() {
    return this.users;
  }

  get paginatedUsers() {
    return this.users; // Backend already paginated
  }

  get totalPages() {
    return this.backendTotalPages || 1;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.page = 1;
    this.selectAll = false;
    this.loadData();
  }

  getStatusColor(status: string) {
    if (status === 'Active') return 'bg-green-100 text-green-600';
    if (status === 'Inactive') return 'bg-red-100 text-red-600';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-600';
    if (status === 'Flagged') return 'bg-[#FDF63B33] text-[#FDF63B]';
    return 'bg-gray-100 text-gray-600';
  }

  // --- Actions ---
  onSearch() {
    this.page = 1;
    this.loadData();
  }

  toggleSelectAll() {
    this.paginatedUsers.forEach((u) => (u.selected = this.selectAll));
  }

  checkIfAllSelected() {
    this.selectAll = this.paginatedUsers.length > 0 && this.paginatedUsers.every((u) => u.selected);
  }

  anySelected() {
    return this.users.some((u) => u.selected);
  }

  deleteSelectedUsers() {
    this.users = this.users.filter((u) => !u.selected);
    this.selectAll = false;
  }

  toggleMenu(user: User) {
    this.openedUser = this.openedUser === user ? null : user;
  }

  @HostListener('document:click', ['$event'])
  closeMenu(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (!t.closest('.action-menu')) this.openedUser = null;
  }

  viewProfile(user: User) {
    this.router.navigate([`${getAdminBasePath()}/manage-user/instructor-profile`, user.email]);
    this.openedUser = null;
  }

  changeStatus(user: User, status: string) {
    const apiStatus = status.toLowerCase();
    this.isLoading = true;
    this.allInstructorService.updateInstructorStatus(user.id, apiStatus).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.openModal('Success', res?.message || 'Instructor status changed successfully');
        this.loadData();
        this.openedUser = null;
      },
      error: (e) => {
        this.isLoading = false;
        const msg = e?.error?.message || e?.message || 'Failed to update status';
        this.openModal('Error', msg);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Pagination Controls
  goNext() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadData();
    }
  }

  goPrev() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }

  // --- Document Methods ---
  viewDocuments(user: User) {
    console.log('Viewing documents for:', user.name);
    this.openedUser = null;
  }

  verifyDocuments(user: User) {
    this.isLoading = true;
    this.allInstructorService.updateInstructorStatus(user.id, 'active').subscribe({
      next: (res) => {
        this.isLoading = false;
        this.openModal('Success', res?.message || 'Instructor verified successfully');
        this.loadData();
        this.openedUser = null;
      },
      error: (e) => {
        this.isLoading = false;
        const msg = e?.error?.message || e?.message || 'Failed to verify instructor';
        this.openModal('Error', msg);
      }
    });
  }

  // --- Modal Helpers ---
  openModal(title: 'Success' | 'Error', message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = title;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
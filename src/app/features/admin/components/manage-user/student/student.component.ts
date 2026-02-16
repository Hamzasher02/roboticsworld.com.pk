import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getAdminBasePath } from '../../../../../core/config/admin-routes.config';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { StudentService } from '../../../../../core/services/admin/student/student.service';
import { StudentListItem } from '../../../../../core/interfaces/admin/all-student';
import { StatusModalComponent } from '../../../../../shared/components/status-modal/status-modal.component';

interface Student {
  name: string;
  email: string;
  course: string;
  accountStatus: string;
  avatar: string;
  id: string;
  selected?: boolean;
}

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent],
  templateUrl: './student.component.html',
})
export class StudentComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  tabs = ['All', 'Active', 'Inactive'];
  activeTab = 'All';

  // --- Modal State ---
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'Success' | 'Error' = 'Success';

  constructor(
    private router: Router,
    private studentService: StudentService
  ) { }

  students: Student[] = [];
  searchQuery = '';
  isLoading = false;

  page = 1;
  pageSize = 10;
  totalItems = 0;
  backendTotalPages = 1;
  selectAll = false;
  openedStudent: Student | null = null;

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;

    this.studentService.getStudentsList(this.searchQuery, this.activeTab, this.page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ students, pagination }) => {
          this.students = (students ?? []).map((s: StudentListItem) => ({
            name: s.name,
            email: s.email,
            course: s.courses,
            accountStatus: this.mapStatusToUi(s.accountStatus),
            avatar: s.profilePictureUrl ?? 'https://i.pravatar.cc/150?img=10',
            id: s.id,
            selected: false,
          }));

          if (pagination) {
            this.backendTotalPages = pagination.totalPages;
            this.totalItems = pagination.totalStudents;
          }

          this.selectAll = false;
          this.openedStudent = null;
          this.isLoading = false;
        },
        error: () => {
          this.students = [];
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Helper to map API status to UI Tab casing ---
  private mapStatusToUi(s?: string): string {
    const v = (s ?? '').toLowerCase().trim();
    return v; // Directly return backend value (active, inactive, pending, flagged, etc)
  }

  // --- Tabs ---
  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.page = 1;
    this.selectAll = false;
    this.loadStudents(); // Reload data with new status
  }

  // --- Search ---
  onSearch() {
    this.page = 1; // Reset to page 1 on search
    this.loadStudents();
  }

  // --- Status Color ---
  getStatusColor(accountStatus: string) {
    const s = (accountStatus ?? '').toLowerCase();
    if (s === 'active') return 'bg-[#E7F8F0] text-[#2D8A61] border-[#B2E5D2]';
    if (s === 'inactive') return 'bg-[#FFE9E9] text-[#E63946] border-[#FFD2D2]';
    if (s === 'pending') return 'bg-[#FFF9E7] text-[#D4A017] border-[#FFEBBF]';
    if (s === 'flagged') return 'bg-[#FFF0E6] text-[#E76F51] border-[#FFD8BF]';
    return 'bg-gray-100 text-gray-500 border-gray-200';
  }

  // --- Filtering & Pagination ---
  get filteredStudents() {
    return this.students; // Server-side filtering
  }

  get paginatedStudents() {
    return this.students; // Backend already paginated
  }

  get totalPages() {
    return this.backendTotalPages || 1;
  }

  goNext() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadStudents();
    }
  }

  goPrev() {
    if (this.page > 1) {
      this.page--;
      this.loadStudents();
    }
  }

  // --- Selection ---
  toggleSelectAll() { this.paginatedStudents.forEach(s => (s.selected = this.selectAll)); }
  checkIfAllSelected() { this.selectAll = this.paginatedStudents.every(s => s.selected); }
  anySelected() { return this.students.some(s => s.selected); }

  // --- Bulk Action ---
  markSelectedInactive() {
    const selected = this.students.filter(s => s.selected);
    if (!selected.length) return;

    let completed = 0;
    selected.forEach(s => {
      this.studentService.updateStudentStatus(s.email, 'inactive').subscribe({
        next: () => {
          completed++;
          if (completed === selected.length) {
            this.loadStudents();
            this.selectAll = false;
          }
        },
        error: () => {
          completed++;
          if (completed === selected.length) this.loadStudents();
        }
      });
    });
  }

  // --- Action Menu ---
  toggleMenu(student: Student) {
    this.openedStudent = this.openedStudent === student ? null : student;
  }

  @HostListener('document:click', ['$event'])
  closeMenu(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (!t.closest('.action-menu')) this.openedStudent = null;
  }

  // --- Actions ---
  viewProfile(student: Student) {
    this.router.navigate([`${getAdminBasePath()}/manage-user/student-profile`, student.email]);
    this.openedStudent = null;
  }

  viewProgress(student: Student) { console.log('View Progress', student); this.openedStudent = null; }

  changeStatus(student: Student, status: string) {
    const apiStatus = status.toLowerCase();
    this.isLoading = true;

    this.studentService.updateStudentStatus(student.id, apiStatus).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.openModal('Success', res?.message || 'Student status changed successfully');
        this.loadStudents();
        this.openedStudent = null;
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.message || 'Failed to update status';
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

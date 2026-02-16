import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DeletionHistoryService } from '../../../../core/services/admin/deletion-history/deletion-history.service';
import { DeletionHistoryItem, GetAllDeletionHistoryResponse } from '../../../../core/interfaces/admin/deletion-history';
import { StatusModalComponent } from '../../../../shared/components/status-modal/status-modal.component';

type DeleteType = 'All' | 'User' | 'Course' | 'Material';
type DateFilter = 'All' | 'Today' | 'This Week' | 'This Month' | 'Custom';

// View Model matching exact fields used in HTML template to avoid breaking UI
interface DeletedItemView {
  id: string;         // mapped from _id
  name: string;       // mapped from itemName
  deletionDate: string; // mapped from createdAt
  deletedBy: string;  // mapped from performedBy
  type: string;       // mapped from itemModel
  canTrash?: boolean; // logic placeholder
  selected?: boolean;

  // Internal use for actions
  originalItem: DeletionHistoryItem;
}

@Component({
  selector: 'app-delete-history',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent],
  templateUrl: './delete-history.component.html',
  styleUrl: './delete-history.component.css',
})
export class DeleteHistoryComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  dateRangeText = '24 March 2023-Today'; // Ideally dynamic based on dateFilter

  activeTab: 'deletedItems' = 'deletedItems';

  typeFilter: DeleteType = 'All';
  dateFilter: DateFilter = 'All';

  // Pagination from backend
  page = 1;
  pageSize = 10;
  totalPages = 1;
  totalRecords = 0;
  isLoading = false;

  items: DeletedItemView[] = [];

  // Modal State
  showDeleteModal = false;
  pendingDeleteRow: DeletedItemView | null = null;
  pendingRestoreRow: DeletedItemView | null = null;
  showRestoreModal = false;

  // Status Modal State
  statusModal = {
    show: false,
    type: 'Success' as 'Success' | 'Error',
    title: '',
    message: ''
  };

  constructor(private deleteService: DeletionHistoryService) { }

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHistory(): void {
    this.isLoading = true;

    // Future: Logic to convert dateFilter to ISO strings (startDate, endDate)
    const startDate: string | undefined = undefined;
    const endDate: string | undefined = undefined;

    this.deleteService.getAllDeletionHistory(this.page, this.pageSize, this.typeFilter, startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: GetAllDeletionHistoryResponse) => {
          this.isLoading = false;
          if (res.success) {
            this.totalPages = res.pagination.totalPages;
            this.totalRecords = res.pagination.totalRecords;
            this.page = res.pagination.currentPage; // Synchronize with backend

            this.items = (res.data ?? []).map((item) => this.mapToView(item));
          } else {
            this.items = [];
            console.error(res.message);
          }
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.items = [];
          const msg = this.getErrorMessage(err);
          console.error(msg);
          // Optional: Show toast here
        }
      });
  }

  private mapToView(item: DeletionHistoryItem): DeletedItemView {
    const performedBy = item.performedBy
      ? `${item.performedBy.firstName} ${item.performedBy.lastName}`.trim() || item.performedBy.email
      : 'Unknown';

    let dateStr = item.createdAt;
    try {
      dateStr = new Date(item.createdAt).toLocaleDateString();
    } catch { }

    return {
      id: item._id,
      name: item.itemName,
      deletionDate: dateStr,
      deletedBy: performedBy,
      type: item.itemModel,
      canTrash: item.itemModel !== 'Role', // Hide trash for Role
      selected: false,
      originalItem: item
    };
  }

  private getErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      return err.error?.message || err.message || 'Server Error';
    }
    if (err instanceof Error) return err.message;
    return String(err);
  }

  // ------------------ UI / Filters ------------------

  // Called when filter dropdown changes
  onFilterChange(): void {
    this.page = 1; // Reset to page 1 on filter change
    this.loadHistory();
  }

  // Placeholder for date filter change
  onDateFilterChange(): void {
    this.page = 1;
    this.loadHistory();
  }

  // ------------------ Pagination ------------------
  // Wired to Backend API

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadHistory();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadHistory();
    }
  }

  // Used by existing template helpers (if any remain)
  get pagedItems(): DeletedItemView[] {
    // Since we are doing server-side pagination, 'items' IS the paged items.
    return this.items;
  }

  // Accessor for template if it uses unfiltered list (not applicable here as we fetch filtered)
  get filteredItems(): DeletedItemView[] {
    return this.items;
  }

  // ------------------ Selection ------------------

  toggleSelectAllOnPage(checked: boolean): void {
    this.items.forEach((x) => (x.selected = checked));
  }

  get allOnPageSelected(): boolean {
    return this.items.length > 0 && this.items.every((x) => !!x.selected);
  }

  onRowSelectChange(): void {
    // Just trigger change detection
  }

  trackById(_: number, item: DeletedItemView): string {
    return item.id;
  }

  goBack(): void {
    history.back();
  }

  // ------------------ Actions (Placeholders) ------------------

  // RESTORE WORKFLOW
  openRestoreModal(row: DeletedItemView): void {
    this.pendingRestoreRow = row;
    this.showRestoreModal = true;
  }

  closeRestoreModal(): void {
    this.showRestoreModal = false;
    this.pendingRestoreRow = null;
  }

  // Now called by "Restore" button in template (replacing direct call)
  restoreItem(row: DeletedItemView): void {
    // Directly show modal instead of window.confirm
    this.openRestoreModal(row);
  }

  confirmRestore(): void {
    if (!this.pendingRestoreRow) return;
    const row = this.pendingRestoreRow;

    this.isLoading = true;
    this.deleteService.restoreItem(row.originalItem).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showToast('Success', 'Restored Successfully', `Item "${row.name}" has been restored.`);
        this.closeRestoreModal();
        this.loadHistory(); // Refresh list
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Restore failed', err);
        this.showToast('Error', 'Restore Failed', this.getErrorMessage(err));
        this.closeRestoreModal();
      }
    });
  }

  // DELETE WORKFLOW
  openDeleteModal(row: DeletedItemView): void {
    this.pendingDeleteRow = row;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.pendingDeleteRow = null;
  }

  confirmPermanentDelete(): void {
    if (!this.pendingDeleteRow) return;

    const row = this.pendingDeleteRow;
    this.isLoading = true;

    this.deleteService.deletePermanently(row.originalItem).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showToast('Success', 'Deleted Permanently', `Item "${row.name}" has been deleted.`);
        this.closeDeleteModal();
        this.loadHistory();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Delete failed', err);
        this.showToast('Error', 'Deletion Failed', this.getErrorMessage(err));
        this.closeDeleteModal();
      }
    });
  }

  // Strategy to normalize backend models to predictable keys
  private getActionKey(itemModel: string): string {
    if (!itemModel) return 'unknown';
    const lower = itemModel.toLowerCase();

    // Add mapping as backend model names become known
    if (lower.includes('staff') || lower.includes('user')) return 'user';
    if (lower.includes('course')) return 'course';
    if (lower.includes('material')) return 'material';

    return lower;
  }

  // --- Status Modal Helper ---
  showToast(type: 'Success' | 'Error', title: string, message: string) {
    this.statusModal = {
      show: true,
      type,
      title,
      message
    };
  }

  closeStatusModal() {
    this.statusModal.show = false;
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NameChangeService } from '../../../../../core/services/admin/name-change/name-change.service';
import { finalize } from 'rxjs';
import { StatusModalComponent } from '../../../../../shared/components/status-modal/status-modal.component';

type StudentInfo = {
  name: string;
  email: string;
  studentId: string;
  requestDate: string;
};

type CourseInfo = {
  courseName: string;
  courseId: string;
  completionDate: string;
  grade: string;
};

@Component({
  selector: 'app-cirtificate',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent],
  templateUrl: './cirtificate.component.html',
  styleUrl: './cirtificate.component.css',
})
export class CirtificateComponent implements OnChanges {
  private nameChangeService = inject(NameChangeService);

  @Input() row: any = null;
  @Output() closePopup = new EventEmitter<void>();
  @Output() rejectRequest = new EventEmitter<any>();
  @Output() approveRequest = new EventEmitter<any>();

  // Data state
  student: StudentInfo = {
    name: '',
    email: '',
    studentId: '',
    requestDate: '',
  };

  course: CourseInfo = {
    courseName: '',
    courseId: '',
    completionDate: '',
    grade: '',
  };

  certificateId = '';
  currentName = '';

  form = {
    requestedName: '',
    reason: '',
  };

  // Loading states
  isLoading = false;      // For initial data fetch
  isProcessing = false;   // For approve/reject operations
  processingAction: 'approve' | 'reject' | null = null; // Track which action is processing

  // Status Modal State
  statusModal = {
    show: false,
    title: '',
    message: '',
    type: 'Success' as 'Success' | 'Error'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['row'] && this.row) {
      const id = this.row.id || this.row._id;
      if (id) {
        this.fetchDetails(id);
      }
    }
  }

  fetchDetails(id: string) {
    this.isLoading = true;

    this.nameChangeService.getSingleNameChangeRequest(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const data = res.data;
            this.currentName = `${data.createdBy?.firstName || ''} ${data.createdBy?.lastName || ''}`.trim();
            this.form.requestedName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
            this.form.reason = data.reasonForCorrection || '';

            this.student = {
              name: this.currentName,
              email: data.createdBy?.email || '',
              studentId: data.createdBy?._id || '',
              requestDate: new Date(data.createdAt).toLocaleDateString()
            };
          }
        },
        error: (err) => {
          console.error('Failed to fetch name change details', err);
          this.openModal('Error', 'Failed to load request details. Please try again.');
        }
      });
  }

  /**
   * Unified handler for approve/reject operations
   * Prevents code duplication and centralizes business logic
   */
  private processRequest(isApproved: boolean) {
    const id = this.row?.id || this.row?._id;
    const action = isApproved ? 'approve' : 'reject';

    console.log(`🎯 ${action} button clicked`);

    // Guard: Validate request ID
    if (!id) {
      console.warn('❌ No request ID found', this.row);
      this.openModal('Error', 'Invalid request. Please reload and try again.');
      return;
    }

    // Guard: Prevent concurrent requests
    if (this.isProcessing) {
      console.warn('❌ Already processing a request');
      return;
    }

    // Clear previous errors
    // Status modal handles its own state

    // Set processing state
    this.isProcessing = true;
    this.processingAction = isApproved ? 'approve' : 'reject';

    console.log(`🚀 Calling API: ${action}`, { requestId: id, isApproved });

    this.nameChangeService.processNameChangeRequest(id, isApproved)
      .pipe(
        finalize(() => {
          console.log(`🏁 ${action} API call completed`);
          this.isProcessing = false;
          this.processingAction = null;
        })
      )
      .subscribe({
        next: (res) => {
          console.log(`✅ ${action} API success:`, res);

          // Emit to parent based on action
          if (isApproved) {
            this.approveRequest.emit(res);
          } else {
            this.rejectRequest.emit(res);
          }

          // Close modal only on successful business operation
          if (res.success) {
            this.closePopup.emit();
          } else {
            // Business rule error (e.g., "Request already approved")
            this.openModal('Error', res.message || `Failed to ${action} request`);
          }
        },
        error: (err) => {
          console.error(`❌ ${action} API error:`, err);

          // Extract error message from backend
          const errorMsg = err?.error?.message || err?.message || `Network error: Failed to ${action} request`;
          this.openModal('Error', errorMsg);

          // Emit error response to parent
          const errorResponse = {
            success: false,
            message: errorMsg
          };

          if (isApproved) {
            this.approveRequest.emit(errorResponse);
          } else {
            this.rejectRequest.emit(errorResponse);
          }
        }
      });
  }

  openModal(type: 'Success' | 'Error', message: string) {
    this.statusModal = {
      show: true,
      title: type === 'Success' ? 'Success' : 'Error',
      message: message,
      type: type
    };
  }

  /**
   * Public handlers (called from template)
   */
  onApprove() {
    this.processRequest(true);
  }

  onReject() {
    this.processRequest(false);
  }

  onCancel() {
    if (this.isProcessing) {
      console.warn('Cannot cancel while processing');
      return;
    }
    this.closePopup.emit();
  }

  close() {
    if (this.isProcessing) {
      console.warn('Cannot close while processing');
      return;
    }
    this.closePopup.emit();
  }

  /**
   * Helper to check if a specific action is processing
   */
  get isApproving(): boolean {
    return this.isProcessing && this.processingAction === 'approve';
  }

  get isRejecting(): boolean {
    return this.isProcessing && this.processingAction === 'reject';
  }

  /**
   * Helper to get action-specific loading text
   */
  get processingText(): string {
    if (!this.isProcessing) return '';
    return this.processingAction === 'approve' ? 'Approving...' : 'Rejecting...';
  }
}

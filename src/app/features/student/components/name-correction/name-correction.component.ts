import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/steam-mind/login.service';
import { NameChangeService } from '../../../../core/services/student/name-change/name-change.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-name-correction',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './name-correction.component.html',
  styleUrl: './name-correction.component.css'
})
export class NameCorrectionComponent implements OnInit, OnDestroy {
  showRequestSubmittedModal = false;
  courseId: string | null = null;
  parentPath: string = 'live-sessions';

  nameChangeForm!: FormGroup;
  currentUserName: string = '';
  isSubmitting: boolean = false;

  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private nameChangeService: NameChangeService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    const parentSnapshot = this.route.parent?.snapshot;
    this.courseId = parentSnapshot?.paramMap.get('id') || null;

    // Detect if parent is live-sessions or recorded-sessions
    const path = parentSnapshot?.url[0]?.path;
    if (path) {
      this.parentPath = path;
    }

    // Initialize form
    this.nameChangeForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      reasonForCorrection: ['']
    });

    // Get current user data from session
    this.subscription.add(
      this.authService.user$.subscribe(user => {
        if (user) {
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          this.currentUserName = `${firstName} ${lastName}`.trim() || 'Not Available';
        } else {
          this.currentUserName = 'Not Available';
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  submitNameCorrection(): void {
    if (this.nameChangeForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const payload = this.nameChangeForm.value;

    this.subscription.add(
      this.nameChangeService.createNameChangeRequest(payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.showRequestSubmittedModal = true;
        },
        error: (error) => {
          this.isSubmitting = false;
          const errorMessage = error?.message || 'Failed to submit name change request. Please try again.';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 3000
          });
        }
      })
    );
  }

  closeRequestSubmitted(): void {
    this.showRequestSubmittedModal = false;
    // Navigate back to generate certificate page
    this.router.navigate(['/student', this.parentPath, this.courseId, 'generate-certificate']);
  }

}

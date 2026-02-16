import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DemoSessionService } from '../../../../core/services/student/demo-session/demo-session.service';
import { DemoSession, CreateDemoSessionRequest } from '../../../../core/interfaces/student/demo-session/demo-session.interface';

@Component({
  selector: 'app-demo-session-request',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './demo-session-request.component.html',
  styleUrl: './demo-session-request.component.css'
})
export class DemoSessionRequestComponent implements OnInit, OnDestroy {
  // Existing demo requests
  myRequests: DemoSession[] = [];

  // Form data
  formData: CreateDemoSessionRequest = {
    courseId: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  };

  // States
  loading = false;
  submitting = false;
  error = '';
  successMessage = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private demoSessionService: DemoSessionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMyRequests();
  }

  loadMyRequests(): void {
    this.loading = true;
    this.error = '';

    const sub = this.demoSessionService.getMyDemoRequests().subscribe({
      next: (requests) => {
        this.myRequests = requests;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load demo requests:', err);
        this.error = 'Failed to load your demo requests';
        this.loading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  submitRequest(): void {
    if (!this.formData.preferredDate) {
      this.error = 'Please select a date for the demo session';
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    this.demoSessionService.createDemoRequest(this.formData).subscribe({
      next: (demoSession) => {
        this.successMessage = 'Demo session request submitted successfully!';
        this.myRequests.unshift(demoSession);
        this.resetForm();
        this.submitting = false;
      },
      error: (err) => {
        console.error('Failed to create demo request:', err);
        this.error = err.message || 'Failed to submit demo request. Please try again.';
        this.submitting = false;
      }
    });
  }

  resetForm(): void {
    this.formData = {
      courseId: '',
      preferredDate: '',
      preferredTime: '',
      notes: ''
    };
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}


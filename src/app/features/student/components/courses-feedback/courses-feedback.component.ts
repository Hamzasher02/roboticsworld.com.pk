import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor } from '@angular/common';
import { FeedbackService } from '../../../../core/services/student/feedback/feedback.service';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-courses-feedback',
  imports: [NgFor, FormsModule],
  templateUrl: './courses-feedback.component.html',
  styleUrl: './courses-feedback.component.css'
})
export class CoursesFeedbackComponent {
  rating = 0;
  feedbackText = '';
  isSubmitting = false;

  constructor(
    private feedbackService: FeedbackService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) { }

  setRating(r: number) {
    this.rating = r;
  }

  async submitFeedback() {
    if (this.rating === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a rating' });
      return;
    }
    if (!this.feedbackText.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter your feedback' });
      return;
    }

    const courseId = this.route.parent?.snapshot.params['id'];
    if (!courseId) {
      console.error('Course ID not found');
      return;
    }

    this.isSubmitting = true;
    try {
      await firstValueFrom(this.feedbackService.createFeedback(courseId, {
        rating: this.rating,
        feedbackText: this.feedbackText
      }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Feedback submitted successfully' });

      // Delay navigation slightly to allow user to see the success toast
      setTimeout(() => {
        this.router.navigate(['/student/live-sessions', courseId]);
      }, 1500);

    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.error?.message || error.message || 'Failed to submit feedback. Please try again.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack(): void {
    // Navigate to parent route (../  relative to current route)
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}


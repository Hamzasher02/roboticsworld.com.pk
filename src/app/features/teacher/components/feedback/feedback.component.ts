// feedback.component.ts (COMPLETE)
import { CommonModule, Location } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CourseFeedbackService } from '../../../../core/services/teacher/feedback/course-feedback.service';
import { ApiCourseFeedbackItem } from '../../../../core/interfaces/teacher/feedback/feedback';

type FeedbackItem = {
  id: string;
  name: string;
  timeAgo: string;
  avatar: string;
  rating: number;
  tag: string; // ✅ courseTitle
  message: string;
  type: 'Student' | 'Admin';
};

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.component.html',
})
export class FeedbackComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private location: Location,
    private feedbackApi: CourseFeedbackService
  ) {}

  // UI
  filter: 'Student' | 'Admin' = 'Student';
  isLoading = false;

  feedbacks: FeedbackItem[] = [];

  // ✅ ALWAYS instructor-wise (so courseTitle always available)
  ngOnInit(): void {
    this.fetchFeedbacks();
  }

  private fetchFeedbacks(): void {
    this.isLoading = true;

    this.feedbackApi
      .getInstructorWiseAllCourseFeedback()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (res: any) => {
          // ✅ some backends return object, some return [object]
          const payload = Array.isArray(res) ? res[0] : res;

          const list = (payload?.data ?? []) as ApiCourseFeedbackItem[];
          this.feedbacks = list.map((x) => this.mapApiToUi(x));
        },
        error: (err) => {
          console.error('instructor wise feedback api error:', err);
          this.feedbacks = [];
        },
      });
  }

  private mapApiToUi(x: ApiCourseFeedbackItem): FeedbackItem {
    const first = x?.user?.firstName ?? '';
    const last = x?.user?.lastName ?? '';
    const name = `${first} ${last}`.trim() || '—';

    // ✅ courseTitle from API
    const courseTitle = x?.course?.courseTitle?.trim() || '—';

    return {
      id: x._id,
      name,
      timeAgo: this.timeAgoFromIso(x.createdAt),
      avatar:
        x?.user?.profilePicture?.secureUrl ??
        '/assets/instructor-images/courses/Photo.svg',
      rating: Number(x.rating ?? 0),
      tag: courseTitle,
      message: x.feedbackText ?? '—',
      type: 'Student',
    };
  }

  get filteredFeedbacks(): FeedbackItem[] {
    return this.feedbacks.filter((x) => x.type === this.filter);
  }

  onFilterChange() {}

  goBack() {
    this.location.back();
  }

  goDashboard() {
    this.router.navigate(['/instructor/dashboard']);
  }

  trackById(_: number, item: FeedbackItem) {
    return item.id;
  }

  starsArray(n: number) {
    const rating = Math.max(0, Math.min(5, Number(n) || 0));
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) img.src = '/assets/images/avatar.png';
  }

  private timeAgoFromIso(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';

    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return `${diffSec} sec ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mins ago`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hours ago`;

    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} days ago`;

    const diffWeek = Math.floor(diffDay / 7);
    return `${diffWeek} week ago`;
  }
}

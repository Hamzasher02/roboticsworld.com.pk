import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { CourseDetailData, CourseDetailResponse } from '../../../../core/interfaces/student/course-detail/course-detail';
import { CoursesService } from '../../../../core/services/student/get-all-courses/get-all-courses.service';
import { StudentEnrollmentStateService } from '../../../../core/services/student/enrollment/student-enrollment-state.service';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
import { WishlistService } from '../../../../core/services/student/wishlist/wishlist.service';
import { CartService } from '../../../../core/services/student/cart/cart.service';
import { MessageService } from 'primeng/api';
import { StudentQuizService } from '../../../../core/services/student/quiz/quiz.service';
import { Quiz } from '../../../../core/interfaces/student/quiz/quiz.interface';
import { FeedbackService } from '../../../../core/services/student/feedback/feedback.service';
import { CourseFeedback } from '../../../../core/interfaces/student/feedback/feedback.interface';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-view-course',
  standalone: true,
  imports: [RouterLink, CommonModule, CarouselModule],
  templateUrl: './view-course.component.html',
  styleUrls: ['./view-course.component.css']
})
export class ViewCourseComponent implements OnInit, OnDestroy {
  email = "dmiller22@gmail.com";

  courseDetail?: CourseDetailData;
  loading = false;
  error: string | null = null;

  openCurriculumModule: number | null = 1; // default open module 1
  isEnrolled = false;
  enrollmentStatus: 'none' | 'pending' | 'approved' | 'rejected' = 'none';
  rejectionReason: string | null = null;
  checkingStatus = false;

  private sub?: Subscription;
  instructors: any;

  // Quiz data
  courseQuizzes: Quiz[] = [];
  loadingQuizzes = false;
  courseFeedbacks: CourseFeedback[] = [];
  averageRating = 0;
  loadingFeedbacks = false;

  testimonialResponsive = [
    { breakpoint: '1200px', numVisible: 4, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
    { breakpoint: '768px', numVisible: 2, numScroll: 1 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 },
  ];

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private router: Router,
    private enrollmentStateService: StudentEnrollmentStateService,
    private enrollmentService: EnrollmentService,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private messageService: MessageService,
    private quizService: StudentQuizService,
    private feedbackService: FeedbackService
  ) { }

  addToCart(): void {
    if (!this.courseDetail || !this.courseDetail.course || !this.courseDetail.course._id) {
      console.error('No course ID available for cart');
      return;
    }

    if (this.enrollmentStatus === 'approved') {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'You are already enrolled in this course.' });
      return;
    }

    if (this.cartService.isInCart(this.courseDetail.course._id)) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'This course is already in your cart.' });
      return;
    }

    const type: 'Live Classes' | 'Recorded Lectures' = this.courseDetail.course.courseEnrollementType === 'live'
      ? 'Live Classes'
      : 'Recorded Lectures';

    this.cartService.addToCart(this.courseDetail.course._id, type).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Course added to cart successfully' }),
      error: (err) => {
        console.error('Failed to add to cart:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Failed to add course to cart.' });
      }
    });
  }

  addToWishlist(): void {
    if (!this.courseDetail || !this.courseDetail.course || !this.courseDetail.course._id) {
      console.error('No course ID available for wishlist');
      return;
    }

    if (this.wishlistService.isInWishlist(this.courseDetail.course._id)) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'This course is already in your wishlist.' });
      return;
    }

    this.wishlistService.addToWishlist(this.courseDetail.course._id).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Course added to wishlist successfully' }),
      error: (err) => {
        console.error('Failed to add to wishlist:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Failed to add course to wishlist.' });
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const courseId = params.get('id');
      console.log('ViewCourseComponent - Route Param ID:', courseId);

      if (courseId) {
        this.fetchCourseDetail(courseId);
        this.checkStatus(courseId);
        this.loadCourseFeedbacks(courseId);
        this.cartService.getMyCart().subscribe();
        this.wishlistService.getMyWishlist().subscribe();
      } else {
        console.error('ViewCourseComponent - No courseId found in route params');
        this.error = 'Invalid course ID.';
      }
    });
  }

  /**
   * Fetch course detail from API by ID
   */
  private fetchCourseDetail(courseId: string): void {
    this.loading = true;
    this.error = null;
    console.log('ViewCourseComponent - fetchCourseDetail - calling API with courseId:', courseId);

    this.sub = this.coursesService.getSingleCourseStudentSide(courseId).subscribe({
      next: (res: CourseDetailResponse) => {
        console.log('ViewCourseComponent - API Response:', res);
        if (res.success) {
          console.log('ViewCourseComponent - Course loaded:', res.data.course.courseTitle);
          this.courseDetail = res.data;
        } else {
          console.error('ViewCourseComponent - API returned unsuccessful:', res.message);
          this.error = res.message || 'Failed to load course.';
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('ViewCourseComponent - API Error (Raw):', err);
        this.error = 'Failed to load course details. Please try again later.';
        this.loading = false;
      }
    });
  }

  /**
   * Load quizzes for the current course
   */
  private loadCourseQuizzes(courseId: string): void {
    if (!this.isEnrolled) {
      this.courseQuizzes = [];
      return;
    }
    this.loadingQuizzes = true;
    this.quizService.getAvailableQuizzes(courseId).subscribe({
      next: (quizzes: Quiz[]) => {
        this.courseQuizzes = quizzes;
        this.loadingQuizzes = false;
        console.log('Course quizzes loaded:', quizzes);
      },
      error: (err: any) => {
        console.error('Failed to load course quizzes:', err);
        this.loadingQuizzes = false;
      }
    });
  }

  /**
   * Load feedbacks for the current course
   */
  private loadCourseFeedbacks(courseId: string): void {
    this.loadingFeedbacks = true;
    this.feedbackService.getCourseFeedbacks(courseId).subscribe({
      next: (res) => {
        // Since ApiClientService extracts 'data', res is the array itself
        this.courseFeedbacks = res || [];

        // Calculate average rating manually as it's not in the API response
        if (this.courseFeedbacks.length > 0) {
          const sum = this.courseFeedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
          this.averageRating = sum / this.courseFeedbacks.length;
        } else {
          this.averageRating = 0;
        }

        this.loadingFeedbacks = false;
        console.log('Course feedbacks loaded:', res);
      },
      error: (err) => {
        console.error('Failed to load course feedbacks:', err);
        this.loadingFeedbacks = false;
      }
    });
  }

  private checkStatus(courseId: string): void {
    this.checkingStatus = true;
    this.enrollmentService.checkEnrollmentStatus(courseId).subscribe({
      next: (res) => {
        console.log('ViewCourse - checkStatus Result:', res);
        // isEnrolled = true means approved, but we also need to check for pending
        if (res.isEnrolled) {
          this.isEnrolled = true;
          this.enrollmentStatus = 'approved';
          this.rejectionReason = null;
        } else if (res.enrollment) {
          // Has enrollment but not approved - check the status
          this.isEnrolled = false;
          const status = (res.enrollment.enrollmentStatus || 'pending').toLowerCase();
          this.enrollmentStatus = status as any;
          this.rejectionReason = res.enrollment.rejectReason || null;
        } else {
          this.isEnrolled = false;
          this.enrollmentStatus = 'none';
          this.rejectionReason = null;
        }
        this.checkingStatus = false;
        // After status is checked, load or clear quizzes
        const courseId = this.route.snapshot.paramMap.get('id');
        if (courseId) {
          this.loadCourseQuizzes(courseId);
        }
      },
      error: (err) => {
        console.error('Failed to check enrollment status:', err);
        this.checkingStatus = false;
      }
    });
  }

  /**
   * Toggle curriculum module open/close
   */
  toggleCurriculumModule(moduleNo: number): void {
    this.openCurriculumModule = this.openCurriculumModule === moduleNo ? null : moduleNo;
  }

  getSessions(noOfSession: number | null): number[] {
    if (!noOfSession || noOfSession <= 0) return [];
    return Array.from({ length: noOfSession }, (_, i) => i + 1);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe(); // prevent memory leaks
  }

  onBuyNow(): void {
    // If approved, navigate to course content
    if (this.enrollmentStatus === 'approved') {
      const type = this.courseDetail?.course?.courseEnrollementType === 'recorded'
        ? 'recorded-sessions'
        : 'live-sessions';
      this.router.navigate(['/student', type, this.courseDetail?.course?._id]);
      return;
    }
    // If pending, do nothing
    if (this.enrollmentStatus === 'pending') {
      return;
    }
    // If rejected or none, allow to buy/re-apply
    if (this.courseDetail) {
      console.log('ViewCourse: onBuyNow - ID:', this.courseDetail.course?._id);
      console.log('ViewCourse: onBuyNow - Object:', this.courseDetail);
      this.enrollmentStateService.setCourse(this.courseDetail);
      this.router.navigate(['/student/buy-course']);
    } else {
      console.error('ViewCourse: onBuyNow - No courseDetail available!');
    }
  }

  // Helper for button text
  get buyButtonText(): string {
    switch (this.enrollmentStatus) {
      case 'approved': return 'Go to Course';
      case 'pending': return 'Pending Approval';
      case 'rejected': return 'Re-apply Enrolment';
      default: return 'Buy Now';
    }
  }

  get buyButtonNote(): string | null {
    if (this.enrollmentStatus === 'pending') {
      return 'Your enrollment is under review. You�ll get access once it�s approved.';
    }
    if (this.enrollmentStatus === 'rejected') {
      return this.rejectionReason
        ? `Rejection Reason: ${this.rejectionReason}`
        : 'Your previous request was not approved. You can try again.';
    }
    return null;
  }

  // Helper for button disabled state
  get isBuyButtonDisabled(): boolean {
    return this.enrollmentStatus === 'pending';
  }

  isStudentObject(user: any): user is { firstName?: string; lastName?: string; name?: string; profilePicture?: { secureUrl: string } } {
    return user && typeof user !== 'string' && ('firstName' in user || 'name' in user);
  }
}


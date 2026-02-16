import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../../../core/services/steam-mind/login.service';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
import { StudentCourseService } from '../../../../core/services/student/course/course.service';
import { CartService } from '../../../../core/services/student/cart/cart.service';
import { WishlistService } from '../../../../core/services/student/wishlist/wishlist.service';
import { LoginUser } from '../../../../core/interfaces/steam-mind/login';
import { Enrollment, EnrolledCourseData } from '../../../../core/interfaces/student/enrollments/enrollment.interface';
import { Course } from '../../../../core/interfaces/student/course/course.interface';
import { forkJoin, of } from 'rxjs';
import { catchError, takeWhile, map } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // User data
  user: LoginUser | null = null;

  // Enrollments data
  enrollments: Enrollment[] = [];
  activeEnrollments: Enrollment[] = [];
  pendingEnrollments: Enrollment[] = [];
  completedEnrollments: Enrollment[] = [];
  enrolledCoursesData: EnrolledCourseData[] = [];

  // Courses for exploration
  exploreCourses: any[] = [];
  totalExploreCourses = 0;

  // Cart and Wishlist counts
  cartItemCount = 0;
  wishlistCount = 0;

  // Loading states
  loading = {
    enrollments: false,
    courses: false
  };

  // Error states
  errors = {
    enrollments: '',
    courses: ''
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private enrollmentService: EnrollmentService,
    private courseService: StudentCourseService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private messageService: MessageService
  ) { }

  isEnrolled(courseId: string): boolean {
    return this.enrollments.some(e => {
      const cId = typeof e.course === 'string' ? e.course : e.course._id;
      // Check if enrolled and status is approved/active
      const status = ((e.enrollmentStatus || (e as any).status || '') as string).toLowerCase();
      return cId === courseId && (status === 'approved' || status === 'active');
    });
  }

  addToCart(courseId: string): void {
    if (this.isEnrolled(courseId)) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'You are already enrolled in this course' });
      return;
    }

    if (this.cartService.isInCart(courseId)) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'This course is already in your cart' });
      return;
    }

    this.cartService.addToCart(courseId).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Course added to cart!' }),
      error: (err) => {
        console.error('Failed to add to cart', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add course to cart.' });
      }
    });
  }

  addToWishlist(courseId: string): void {
    if (this.isEnrolled(courseId)) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'You are already enrolled in this course' });
      return;
    }

    if (this.wishlistService.isInWishlist(courseId)) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Already added' });
      return;
    }

    this.wishlistService.addToWishlist(courseId).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Course added to wishlist!' }),
      error: (err) => {
        console.error('Failed to add to wishlist', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add course to wishlist.' });
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to user data
    const userSub = this.authService.user$.subscribe(user => {
      this.user = user;
    });
    this.subscriptions.push(userSub);

    // Subscribe to cart count
    const cartSub = this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });
    this.subscriptions.push(cartSub);

    // Subscribe to wishlist count
    const wishlistSub = this.wishlistService.wishlist$.subscribe(items => {
      this.wishlistCount = items.length;
    });
    this.subscriptions.push(wishlistSub);

    // Load data
    this.loadEnrollments();
    this.loadExploreCourses();
    this.cartService.getMyCart().subscribe();
    this.wishlistService.getMyWishlist().subscribe();
  }

  loadEnrollments(): void {
    this.loading.enrollments = true;
    this.errors.enrollments = '';

    const sub = this.enrollmentService.getUserEnrollments().subscribe({
      next: (response: any) => {
        console.log('Dashboard - Raw Response:', response);
        let enrollments: Enrollment[] = [];

        // Handle case where API returns raw Courses instead of Enrollments
        if (Array.isArray(response) && response.length > 0 && !response[0].enrollmentStatus && response[0].courseTitle) {
          console.warn('Dashboard - API returned raw Courses. Adapting to Enrollment format...');
          enrollments = response.map((course: any) => ({
            _id: 'temp-enrollment-' + course._id,
            user: (this.user as any)?._id || 'current-user',
            course: course,
            enrollmentStatus: 'approved', // Assume approved/active if returned in this list
            enrollmentType: 'Recorded Lectures', // Default
            paymentScreenshot: { publicId: '', secureUrl: '' },
            isDeleted: false,
            createdAt: new Date().toISOString()
          })) as Enrollment[];
        } else {
          enrollments = response as Enrollment[];
        }

        this.enrollments = enrollments;
        this.activeEnrollments = enrollments.filter(e => {
          const status = ((e.enrollmentStatus || (e as any).status || '') as string).toLowerCase();
          return status === 'approved' || status === 'active';
        });
        this.pendingEnrollments = enrollments.filter(e => {
          const status = ((e.enrollmentStatus || (e as any).status || '') as string).toLowerCase();
          return status.includes('pending') || status.includes('waiting');
        });
        this.completedEnrollments = enrollments.filter(e => {
          const status = ((e.enrollmentStatus || (e as any).status || '') as string).toLowerCase();
          return status === 'completed';
        });

        console.log('Dashboard - Stats:', {
          total: this.enrollments.length,
          active: this.activeEnrollments.length,
          pending: this.pendingEnrollments.length,
          completed: this.completedEnrollments.length
        });

        if (this.enrollments.length > 0) {
          this.loadDetailedEnrolledData();
        } else {
          this.loading.enrollments = false;
        }
      },
      error: (err) => {
        console.error('Failed to load enrollments:', err);
        this.errors.enrollments = 'Failed to load enrollments';
        this.loading.enrollments = false;
      }
    });
    this.subscriptions.push(sub);
  }

  loadDetailedEnrolledData(): void {
    // Show all enrollments on dashboard
    // We want to show even pending ones so user sees their status
    const displayEnrollments = this.enrollments;

    const detailRequests = displayEnrollments.map(e => {
      // Check if course is already populated (from our adapter)
      if (typeof e.course === 'object' && e.course !== null && (e.course as any).courseTitle) {
        const rawCourse = e.course as any;
        const mappedCourse: Course = {
          _id: rawCourse._id,
          title: rawCourse.courseTitle || rawCourse.title,
          description: rawCourse.courseOverview?.courseDescription || rawCourse.description || '',
          shortDescription: rawCourse.courseOverview?.courseDescription || rawCourse.description || '',
          thumbnail: rawCourse.courseThumbnail?.secureUrl || rawCourse.thumbnail,
          price: rawCourse.coursePrice ? Number(rawCourse.coursePrice) : (rawCourse.price || 0),
          isPublished: rawCourse.isCoursePublished,
          level: rawCourse.courseLevel,
          category: rawCourse.courseCategory?.[0],
          duration: rawCourse.courseOverview?.courseDuration ? Number(rawCourse.courseOverview.courseDuration) : 0
        };

        const totalLectures = rawCourse.totalLectures || 0;
        const completedCount = e.completedLectures?.length || 0;
        const percentage = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

        const enrolledData: EnrolledCourseData = {
          enrollment: e,
          course: mappedCourse,
          modules: [],
          progress: {
            completed: completedCount,
            total: totalLectures,
            percentage: percentage
          }
        };
        return of(enrolledData);
      }

      const courseId = typeof e.course === 'string' ? e.course : e.course._id;
      return this.enrollmentService.getEnrolledCourseData(courseId).pipe(
        map(data => {
          if (data && data.progress && data.enrollment) {
            // Backend might already provide percentage, otherwise calculate
            const total = data.progress.total || 0;
            const completed = data.enrollment.completedLectures?.length || 0;
            data.progress.percentage = total > 0 ? Math.round((completed / total) * 100) : (data.progress.percentage || 0);
          }
          return data;
        }),
        catchError(err => {
          console.warn(`Failed to load detailed data for course ${courseId} (expected for pending):`, err);

          // If the enrollment is pending, we still want to show it.
          // Create dummy Course data based on what's available
          const status = ((e.enrollmentStatus || (e as any).status || '') as string).toLowerCase();
          if (status.includes('pending') || status.includes('waiting')) {
            const rawCourse = e.course as any;
            const fallbackCourse: Course = {
              _id: courseId,
              title: rawCourse?.courseTitle || 'Course Pending Approval',
              description: '',
              shortDescription: '',
              thumbnail: rawCourse?.courseThumbnail?.secureUrl || '',
              price: Number(rawCourse?.coursePrice) || 0,
              isPublished: true,
              level: rawCourse?.courseLevel || '',
              category: rawCourse?.courseCategory?.[0] || '',
              duration: 0
            };

            return of({
              enrollment: e,
              course: fallbackCourse,
              modules: [],
              progress: { completed: 0, total: 0, percentage: 0 }
            } as EnrolledCourseData);
          }

          return of(null);
        })
      );
    });

    forkJoin(detailRequests).subscribe({
      next: (results) => {
        this.enrolledCoursesData = results.filter((r): r is EnrolledCourseData => r !== null);
        this.loading.enrollments = false;
      },
      error: (err) => {
        console.error('Failed to load detailed enrolled data:', err);
        this.loading.enrollments = false;
      }
    });
  }

  loadExploreCourses(): void {
    this.loading.courses = true;
    this.errors.courses = '';

    const sub = this.courseService.getAllCourses({ limit: 5 }).subscribe({
      next: (res) => {
        this.exploreCourses = (res.data || []).slice(0, 5);
        this.totalExploreCourses = res.pagination?.totalCourses || 0;
        this.loading.courses = false;
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
        this.errors.courses = 'Failed to load courses';
        this.loading.courses = false;
      }
    });
    this.subscriptions.push(sub);
  }

  // Stats getters
  get enrolledCoursesCount(): number {
    return this.enrollments.length;
  }

  get activeCoursesCount(): number {
    return this.activeEnrollments.length;
  }

  get completedCoursesCount(): number {
    return this.completedEnrollments.length;
  }

  // Display only first 4 enrolled courses on dashboard
  get displayedEnrolledCourses(): EnrolledCourseData[] {
    return this.enrolledCoursesData.slice(0, 4);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}


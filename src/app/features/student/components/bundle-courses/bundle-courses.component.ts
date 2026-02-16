import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CartService } from '../../../../core/services/student/cart/cart.service';
import { WishlistService } from '../../../../core/services/student/wishlist/wishlist.service';
import { CoursesService } from '../../../../core/services/student/get-all-courses/get-all-courses.service';
import { Course } from '../../../../core/interfaces/student/get-all-courses/get-all-courses';
import { MessageService } from 'primeng/api';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';

@Component({
  selector: 'app-bundle-courses',
  imports: [RouterLink, CommonModule],
  templateUrl: './bundle-courses.component.html',
  styleUrl: './bundle-courses.component.css'
})
export class BundleCoursesComponent implements OnInit, OnDestroy {
  bundleCourses: Course[] = [];
  loading = false;
  error: string | null = null;
  private sub?: Subscription;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalCourses = 0;
  pageSize = 10;

  enrollments: any[] = [];

  constructor(
    private coursesService: CoursesService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private messageService: MessageService,
    private enrollmentService: EnrollmentService
  ) { }

  isEnrolled(courseId: string): boolean {
    return this.enrollments.some(e => {
      const cId = typeof e.course === 'string' ? e.course : e.course._id;
      const status = ((e.enrollmentStatus || (e as any).status || '') as string).toLowerCase();
      return cId === courseId && (status === 'approved' || status === 'active');
    });
  }

  addToCart(course: Course): void {
    if (this.isEnrolled(course._id)) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'You are already enrolled in this course' });
      return;
    }

    if (this.cartService.isInCart(course._id)) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'This course is already in your cart.' });
      return;
    }

    const type: 'Live Classes' | 'Recorded Lectures' = course.courseEnrollementType === 'live' ? 'Live Classes' : 'Recorded Lectures';
    this.cartService.addToCart(course._id, type).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Course added to cart successfully!' }),
      error: (err) => {
        console.error('Failed to add to cart:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add course to cart.' });
      }
    });
  }

  addToWishlist(course: Course): void {
    // Reverting to Cart logic for consistency
    this.addToCart(course);
  }

  ngOnInit(): void {
    this.fetchBundles();
    this.cartService.getMyCart().subscribe();
    this.wishlistService.getMyWishlist().subscribe();
    this.enrollmentService.getUserEnrollments().subscribe({
      next: (res: any) => {
        if (Array.isArray(res) && res.length > 0 && !res[0].enrollmentStatus && res[0].courseTitle) {
          this.enrollments = res.map((c: any) => ({
            course: c,
            enrollmentStatus: 'approved'
          }));
        } else {
          this.enrollments = res;
        }
      }
    });
  }

  private fetchBundles(): void {
    this.loading = true;
    this.error = null;

    this.sub = this.coursesService.getAllCoursesStudentSide({
      page: this.currentPage,
      limit: this.pageSize
    }).subscribe({
      next: (res) => {
        // Filter for bundles
        this.bundleCourses = (res.data || []).filter(c =>
          (c.courseCategory && c.courseCategory.some(cat => cat.toLowerCase().includes('bundle'))) ||
          (c.courseTitle && c.courseTitle.toLowerCase().includes('bundle'))
        );

        if (res.pagination) {
          this.currentPage = res.pagination.currentPage || 1;
          this.totalPages = res.pagination.totalPages || 1;
          this.totalCourses = res.pagination.totalCourses || (res.pagination as any).totalItems || (res.pagination as any).total || 0;
        } else {
          // Fallback if pagination metadata is missing
          this.totalCourses = (res as any).total || (res as any).totalCourses || this.bundleCourses.length;
          this.totalPages = Math.ceil(this.totalCourses / this.pageSize) || 1;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching bundles:', err);
        this.error = 'Failed to load bundle courses.';
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.fetchBundles();
    }
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}


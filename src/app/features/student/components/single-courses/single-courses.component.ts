import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CoursesService } from '../../../../core/services/student/get-all-courses/get-all-courses.service';
import { Course } from '../../../../core/interfaces/student/get-all-courses/get-all-courses';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/student/cart/cart.service';
import { WishlistService } from '../../../../core/services/student/wishlist/wishlist.service';
import { MessageService } from 'primeng/api';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
@Component({
  selector: 'app-single-courses',
  templateUrl: './single-courses.component.html',
  styleUrls: ['./single-courses.component.css'],
  imports: [RouterLink, CommonModule, FormsModule],
})
export class SingleCoursesComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  allCourses: Course[] = []; // Store all courses from API
  loading = false;
  error: string | null = null;

  // Filter options - will be populated dynamically from API data
  categories: string[] = [];
  courses_list: string[] = []; // For subcategories
  levels: string[] = [];
  ageGroups: string[] = [];

  // Selected filters
  searchQuery = '';
  selectedCategory = 'All Categories';
  selectedCourse = 'All Courses';
  selectedLevel = 'All Levels';
  selectedAgeGroup = 'All Age Group';

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalCourses = 0;
  pageSize = 10;

  private coursesSub?: Subscription;

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
        console.error('Failed to add to cart', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add course to cart.' });
      }
    });
  }

  addToWishlist(course: Course): void {
    // Reverting to Cart logic as per user instruction and 404 error on Wishlist API
    this.addToCart(course);
  }

  ngOnInit(): void {
    this.fetchCourses();
    this.cartService.getMyCart().subscribe();
    this.wishlistService.getMyWishlist().subscribe();
    this.enrollmentService.getUserEnrollments().subscribe({
      next: (res: any) => {
        // Handle raw course response if needed, similar to dashboard
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

  fetchCourses(): void {
    this.loading = true;
    this.error = null;

    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    if (this.selectedCategory !== 'All Categories') {
      params.category = this.selectedCategory;
    }

    if (this.selectedLevel !== 'All Levels') {
      params.level = this.selectedLevel;
    }

    if (this.selectedCourse !== 'All Courses') {
      params.subCategory = this.selectedCourse;
    }

    if (this.selectedAgeGroup !== 'All Age Group') {
      params.ageGroup = this.selectedAgeGroup;
    }

    this.coursesSub = this.coursesService.getAllCoursesStudentSide(params).subscribe({
      next: (res) => {
        this.allCourses = res.data || [];

        // Apply client-side filtering
        this.applyClientSideFilters();

        if (res.pagination) {
          this.currentPage = res.pagination.currentPage || 1;
          this.totalPages = res.pagination.totalPages || 1;
          this.totalCourses = res.pagination.totalCourses || (res.pagination as any).totalItems || (res.pagination as any).total || 0;
        } else {
          // Fallback if pagination metadata is completely missing
          this.totalCourses = (res as any).total || (res as any).totalCourses || this.allCourses.length;
          this.totalPages = Math.ceil(this.totalCourses / this.pageSize) || 1;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
        this.error = 'Failed to load courses. Please try again later.';
        this.loading = false;
      },
    });
  }

  extractFilterOptions(): void {
    if (!this.allCourses || this.allCourses.length === 0) return;

    // Extract unique categories
    const categorySet = new Set<string>();
    this.allCourses.forEach(course => {
      if (course.courseCategory && Array.isArray(course.courseCategory)) {
        course.courseCategory.forEach(cat => categorySet.add(cat));
      }
    });
    this.categories = Array.from(categorySet).sort();

    // Extract unique subcategories (courses)
    const subCategorySet = new Set<string>();
    this.allCourses.forEach(course => {
      if (course.courseSubCategory) {
        subCategorySet.add(course.courseSubCategory);
      }
    });
    this.courses_list = Array.from(subCategorySet).sort();

    // Extract unique levels
    const levelSet = new Set<string>();
    this.allCourses.forEach(course => {
      if (course.courseLevel) {
        levelSet.add(course.courseLevel);
      }
    });
    this.levels = Array.from(levelSet).sort();

    // Extract unique age groups
    const ageGroupSet = new Set<string>();
    this.allCourses.forEach(course => {
      if (course.courseAgeGroup) {
        ageGroupSet.add(course.courseAgeGroup);
      }
    });
    this.ageGroups = Array.from(ageGroupSet).sort();
  }

  applyClientSideFilters(): void {
    let filtered = [...this.allCourses];

    // Apply search filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.courseTitle?.toLowerCase().includes(query) ||
        course.courseOverview?.courseDescription?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.selectedCategory && this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(course =>
        course.courseCategory?.some(cat =>
          cat.toLowerCase() === this.selectedCategory.toLowerCase()
        )
      );
    }

    // Apply course/subcategory filter
    if (this.selectedCourse && this.selectedCourse !== 'All Courses') {
      filtered = filtered.filter(course =>
        course.courseSubCategory?.toLowerCase() === this.selectedCourse.toLowerCase()
      );
    }

    // Apply level filter
    if (this.selectedLevel && this.selectedLevel !== 'All Levels') {
      filtered = filtered.filter(course =>
        course.courseLevel?.toLowerCase() === this.selectedLevel.toLowerCase()
      );
    }

    // Apply age group filter
    if (this.selectedAgeGroup && this.selectedAgeGroup !== 'All Age Group') {
      filtered = filtered.filter(course =>
        course.courseAgeGroup?.toLowerCase().includes(this.selectedAgeGroup.toLowerCase())
      );
    }

    this.courses = filtered;
    this.totalCourses = filtered.length;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.fetchCourses(); // Refetch with new page
    }
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // No extractFilterOptions needed (using static lists for now as we paginate)

  // applyFilters removed - filtering happens on server

  onSearch(event: any): void {
    this.searchQuery = event.target.value;
    this.currentPage = 1;
    this.applyClientSideFilters(); // Use client-side filtering
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyClientSideFilters(); // Use client-side filtering instead of API call
  }

  ngOnDestroy(): void {
    this.coursesSub?.unsubscribe();
  }
}


import { Subscription, forkJoin, of, catchError } from 'rxjs';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
import { Enrollment, EnrolledCourseData } from '../../../../core/interfaces/student/enrollments/enrollment.interface';
import { Course } from '../../../../core/interfaces/student/course/course.interface';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AiAssistantComponent } from "../ai-assistant/ai-assistant.component";
import { SingleCoursesComponent } from "../single-courses/single-courses.component";
import { BundleCoursesComponent } from "../bundle-courses/bundle-courses.component";


type CourseTab = 'single' | 'bundle';

import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-courses',
  imports: [RouterLink, CommonModule, AiAssistantComponent, SingleCoursesComponent, BundleCoursesComponent, FormsModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit, OnDestroy {
  isChatOpen = false;
  activeTab: CourseTab = 'single';

  // Enrollments data
  enrollments: Enrollment[] = [];
  activeEnrollments: Enrollment[] = [];
  pendingEnrollments: Enrollment[] = [];
  enrolledCoursesData: EnrolledCourseData[] = [];

  // Loading states
  loading = {
    enrollments: false
  };

  searchTerm: string = '';
  filteredEnrolledData: EnrolledCourseData[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private enrollmentService: EnrollmentService) { }

  ngOnInit(): void {
    this.loadEnrollments();
  }

  loadEnrollments(): void {
    this.loading.enrollments = true;

    const sub = this.enrollmentService.getUserEnrollments().subscribe({
      next: (response: any) => {
        let enrollments: Enrollment[] = [];

        // Handle case where API returns raw Courses instead of Enrollments
        if (Array.isArray(response) && response.length > 0 && !response[0].enrollmentStatus && response[0].courseTitle) {
          console.warn('CoursesPage - API returned raw Courses. Adapting to Enrollment format...');
          enrollments = response.map((course: any) => ({
            _id: 'temp-enrollment-' + course._id,
            user: 'current-user', // specific user ID not critical for display
            course: course,
            enrollmentStatus: 'approved',
            enrollmentType: 'Recorded Lectures',
            paymentScreenshot: { publicId: '', secureUrl: '' },
            isDeleted: false,
            createdAt: new Date().toISOString()
          })) as Enrollment[];
        } else {
          enrollments = response as Enrollment[];
        }

        this.enrollments = enrollments;
        this.pendingEnrollments = enrollments.filter(e => {
          const status = ((e.enrollmentStatus || (e as any).status || '') as string).toLowerCase();
          return status.includes('pending') || status.includes('waiting');
        });
        this.activeEnrollments = enrollments.filter(e => {
          const status = ((e.enrollmentStatus || (e as any).status || '') as string).toLowerCase();
          return status === 'approved' || status === 'active';
        });

        console.log('CoursesPage - Adapted Enrollments:', enrollments);
        console.log('CoursesPage - Active:', this.activeEnrollments.length);
        console.log('CoursesPage - Pending:', this.pendingEnrollments.length);

        if (this.enrollments.length > 0) {
          this.loadDetailedEnrolledData();
        } else {
          this.loading.enrollments = false;
        }
      },
      error: (err) => {
        console.error('Failed to load enrollments:', err);
        this.loading.enrollments = false;
      }
    });
    this.subscriptions.push(sub);
  }

  loadDetailedEnrolledData(): void {
    // Include both active and pending enrollments for display
    const allDisplayEnrollments = [...this.activeEnrollments, ...this.pendingEnrollments];

    const detailRequests = allDisplayEnrollments.map(e => {
      // Check if course is already populated (from our adapter)
      if (typeof e.course === 'object' && e.course !== null && (e.course as any).courseTitle) {
        const rawCourse = e.course as any;
        // Map backend fields to frontend Course interface
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

        const total = rawCourse.totalLectures || 0;
        const completed = e.completedLectures?.length || 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        const enrolledData: EnrolledCourseData = {
          enrollment: e,
          course: mappedCourse,
          modules: [],
          progress: {
            completed: completed,
            total: total,
            percentage: percentage
          }
        };
        return of(enrolledData);
      }

      const courseId = typeof e.course === 'string' ? e.course : e.course._id;
      return this.enrollmentService.getEnrolledCourseData(courseId).pipe(
        catchError(err => {
          console.warn(`Failed to load data for course ${courseId} (expected for pending):`, err);

          // If pending, create placeholder data
          const status = ((e.enrollmentStatus || (e as any).status || '') as string).toLowerCase();
          if (status.includes('pending')) {
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
        this.filterEnrolledCourses();
        this.loading.enrollments = false;
      },
      error: (err) => {
        console.error('Failed to load detailed enrolled data:', err);
        this.loading.enrollments = false;
      }
    });
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.filterEnrolledCourses();
  }

  filterEnrolledCourses(): void {
    if (!this.searchTerm) {
      this.filteredEnrolledData = [...this.enrolledCoursesData];
      return;
    }
    const search = this.searchTerm.toLowerCase();
    this.filteredEnrolledData = this.enrolledCoursesData.filter(data =>
      data.course.title.toLowerCase().includes(search) ||
      (data.course.description && data.course.description.toLowerCase().includes(search))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}


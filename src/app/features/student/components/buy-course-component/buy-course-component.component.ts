import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { StudentEnrollmentStateService } from '../../../../core/services/student/enrollment/student-enrollment-state.service';
import { CourseDetailData } from '../../../../core/interfaces/student/course-detail/course-detail';

@Component({
  selector: 'app-buy-course-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buy-course-component.component.html',
  styleUrl: './buy-course-component.component.css'
})
export class BuyCourseComponentComponent implements OnInit {
  courseData: CourseDetailData | null = null;
  coursePrice: number | string = 0;

  constructor(
    private enrollmentState: StudentEnrollmentStateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const state = this.enrollmentState.getState();
    if (!state.courseData) {
      console.warn('BuyCourse: No course data found in state. Redirecting to courses.');
      this.router.navigate(['/student/courses']);
      return;
    }
    this.courseData = state.courseData;
    // Assuming coursePrice is available in the course object. adjusting access path if needed based on previous files.
    // In view-course it was: res.data.course.coursePrice.
    // CourseDetailData has { course: { ... }, ... }
    this.coursePrice = this.courseData.course.coursePrice || 0;
    console.log('BuyCourse: Initialized with course:', this.courseData.course.courseTitle);
  }

  selectLiveClasses(): void {
    console.log('BuyCourse: Selected Live Classes');
    this.enrollmentState.setEnrollmentType('Live Classes');
    this.router.navigate(['/student/select-time']);
  }

  selectRecordedClasses(): void {
    console.log('BuyCourse: Selected Recorded Lectures');
    this.enrollmentState.setEnrollmentType('Recorded Lectures');
    this.router.navigate(['/student/checkout']);
  }

  goBack(): void {
    // Navigate back to view-course if possible, or courses
    if (this.courseData) {
      this.router.navigate(['/student/view-course', this.courseData.course._id]);
    } else {
      this.router.navigate(['/student/courses']);
    }
  }
}

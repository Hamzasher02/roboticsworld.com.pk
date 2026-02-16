import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
import { EnrolledCourseData } from '../../../../core/interfaces/student/enrollments/enrollment.interface';
import { StudentCourseService } from '../../../../core/services/student/course/course.service';
import { Course } from '../../../../core/interfaces/student/course/course.interface';

import { LectureDetail } from '../../../../core/interfaces/student/enrollments/enrollment.interface';

@Component({
  selector: 'app-recorded-course-video',
  imports: [RouterLink, CommonModule],
  templateUrl: './recorded-course-video.component.html',
  styleUrl: './recorded-course-video.component.css'
})
export class RecordedCourseVideoComponent implements OnInit {
  courseData: EnrolledCourseData | null = null;
  activeLecture: any = null; // API returns { title, duration, LectureUrl, courseId, moduleId }
  recommendedCourses: Course[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private enrollmentService: EnrollmentService,
    private courseService: StudentCourseService
  ) { }

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourseData(courseId);
    } else {
      this.error = 'Course ID not found';
      this.loading = false;
    }
    this.loadRecommendedCourses();
  }

  private loadCourseData(courseId: string): void {
    this.loading = true;
    this.enrollmentService.getEnrolledCourseData(courseId).subscribe({
      next: (data) => {
        this.courseData = data;

        // After loading course data, determine which lecture to play
        this.route.queryParams.subscribe(params => {
          const lectureId = params['lectureId'];
          const moduleId = params['moduleId'];

          if (lectureId && moduleId && data.enrollment?._id) {
            this.loadLectureDetail(data.enrollment._id, moduleId, lectureId);
          } else if (data.enrollment?._id) {
            // Fallback to default current lesson
            const defaultLesson = this.calculateDefaultLesson();
            if (defaultLesson && defaultLesson.moduleId) {
              this.loadLectureDetail(data.enrollment._id, defaultLesson.moduleId, defaultLesson.lecture._id);
            } else {
              this.loading = false;
            }
          } else {
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load course data:', err);
        this.error = 'Failed to load course data';
        this.loading = false;
      }
    });
  }

  private loadLectureDetail(enrollmentId: string, moduleId: string, lectureId: string): void {
    this.loading = true;
    // Use StudentCourseService.getSingleLectureStudentSide instead of enrollment service
    this.courseService.getSingleLectureStudentSide(lectureId).subscribe({
      next: (response: any) => {
        // API returns { success, message, data: { title, duration, LectureUrl, ... } }
        this.activeLecture = response;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load lecture detail:', err);
        this.loading = false;
      }
    });
  }

  private calculateDefaultLesson(): { lecture: any, moduleId: string } | null {
    if (!this.courseData || !this.courseData.modules) return null;
    for (const module of this.courseData.modules) {
      if (module.lectures) {
        for (const lecture of module.lectures) {
          if (!this.courseData.enrollment.completedLectures?.includes(lecture._id)) {
            return { lecture, moduleId: module._id };
          }
        }
      }
    }
    // If all completed, return first
    const firstModule = this.courseData.modules[0];
    if (firstModule && firstModule.lectures && firstModule.lectures.length > 0) {
      return { lecture: firstModule.lectures[0], moduleId: firstModule._id };
    }
    return null;
  }

  private loadRecommendedCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (res) => {
        this.recommendedCourses = (res.data || []).slice(0, 5);
      }
    });
  }

  get currentLesson(): any {
    if (!this.courseData || !this.courseData.modules) return null;
    for (const module of this.courseData.modules) {
      if (module.lectures) {
        for (const lecture of module.lectures) {
          if (!this.courseData.enrollment.completedLectures?.includes(lecture._id)) {
            return lecture;
          }
        }
      }
    }
    return this.courseData?.modules?.[0]?.lectures?.[0] || null;
  }
}


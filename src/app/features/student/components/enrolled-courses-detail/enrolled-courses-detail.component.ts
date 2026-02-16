import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
import { SessionsService } from '../../../../core/services/student/sessions/sessions.service';
import { CoursesService } from '../../../../core/services/student/get-all-courses/get-all-courses.service';
import { StudentQuizService } from '../../../../core/services/student/quiz/quiz.service';
import { EnrolledCourseData } from '../../../../core/interfaces/student/enrollments/enrollment.interface';
import { CourseSession } from '../../../../core/interfaces/student/sessions/sessions.interface';
import { Quiz, QuizAttempt } from '../../../../core/interfaces/student/quiz/quiz.interface';

@Component({
  selector: 'app-enrolled-courses-detail',
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './enrolled-courses-detail.component.html',
  styleUrl: './enrolled-courses-detail.component.css'
})
export class EnrolledCoursesDetailComponent implements OnInit {
  courseData: EnrolledCourseData | null = null;
  upcomingSession: CourseSession | null = null;
  loading = true;
  loadingSessions = false;
  loadingQuizzes = false;
  error = '';
  openLessonModule: number | null = 0;

  // Quiz data
  courseQuizzes: Quiz[] = [];
  quizAttempts: QuizAttempt[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enrollmentService: EnrollmentService,
    private sessionsService: SessionsService,
    private coursesService: CoursesService,
    private quizService: StudentQuizService
  ) { }

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourseData(courseId);
      this.loadQuizzes(courseId);
    } else {
      this.error = 'Course ID not found';
      this.loading = false;
    }
  }

  private normalizeToArray<T>(val: any): T[] {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }

  private getId(val: any): string {
    return (val?._id || val?.id || '').toString();
  }

  private loadCourseData(courseId: string): void {
    this.loading = true;

    this.enrollmentService.getEnrolledCourseData(courseId).subscribe({
      next: (data: any) => {
        // Redirection Check - Only redirect if we are on the main course detail path
        // This prevents redirection loops for child routes like feedback/certificate
        const isParentPath = this.router.url.split('/').length === 4; // /student/live-sessions/:id
        if (data.enrollment?.enrollmentType === 'Recorded Lectures' && isParentPath) {
          this.router.navigate(['/student/recorded-sessions', courseId], { replaceUrl: true });
          return;
        }

        // Ensure progress exists
        if (!data.progress) {
          data.progress = {
            completed: 0,
            total: data.course?.totalLectures || 0,
            percentage: 0
          };
        }

        // Normalize modules (handle mongoose _doc)
        if (data.modules && data.modules.length > 0) {
          data.modules = data.modules.map((m: any) => m._doc || m);
        }

        // Normalize course properties
        if (data.course) {
          data.course.title = data.course.courseTitle || data.course.title;
          if (data.course.courseThumbnail?.secureUrl) {
            data.course.thumbnail = data.course.courseThumbnail.secureUrl;
          }
        }

        // ? Normalize + group module-level content
        if (data.modules && data.modules.length > 0) {
          // Collect possible quiz sources (top-level, course-level)
          const topLevelQuizzes = this.normalizeToArray<any>(data.quizzes);
          const courseLevelQuizzes = this.normalizeToArray<any>(data?.course?.quizzes);

          // Deduplicate all quizzes by id
          const globalQuizMap = new Map<string, any>();
          for (const q of [...topLevelQuizzes, ...courseLevelQuizzes]) {
            const id = this.getId(q);
            if (id) globalQuizMap.set(id, q);
          }
          const globalQuizzes = Array.from(globalQuizMap.values());

          data.modules = data.modules.map((m: any) => {
            const mod = m._doc || m;

            mod.title = mod.moduleName || mod.title;
            mod.description = mod.moduleDescription || mod.description;

            // Group lectures (if returned top-level)
            if (data.lectures && Array.isArray(data.lectures)) {
              mod.lectures = data.lectures.filter((l: any) =>
                (l.moduleId === mod._id || l.module === mod._id || l.belongTo === mod._id)
              );
            } else {
              mod.lectures = this.normalizeToArray<any>(mod.lectures);
            }

            // Group PDFs (if returned top-level)
            if (data.pdfMaterials && Array.isArray(data.pdfMaterials)) {
              mod.pdfs = data.pdfMaterials.filter((p: any) =>
                (p.moduleId === mod._id || p.module === mod._id || p.belongTo === mod._id)
              );
            } else {
              mod.pdfs = this.normalizeToArray<any>(mod.pdfs);
            }

            // ? Group quizzes robustly:
            // include module.quizzes + global quizzes
            const moduleLevelQuizzes = this.normalizeToArray<any>(mod.quizzes);

            const localMap = new Map<string, any>();
            for (const q of [...globalQuizzes, ...moduleLevelQuizzes]) {
              const id = this.getId(q);
              if (id) localMap.set(id, q);
            }
            const allQuizzes = Array.from(localMap.values());

            mod.quizzes = allQuizzes.filter((q: any) =>
              (q.moduleId === mod._id || q.module === mod._id || q.belongTo === mod._id)
            );

            return mod;
          });
        }

        // Sessions (Fetch specifically for Live Classes)
        if (data.enrollment && data.enrollment._id) {
          this.loadingSessions = true; // Add a loading state for sessions if desired
          this.sessionsService.getEnrollmentSessions(data.enrollment._id).subscribe({
            next: (sessions) => {
              if (sessions && Array.isArray(sessions) && sessions.length > 0) {
                data.sessions = sessions;
                this.processSessions(data);
              } else if (data.sessions && data.sessions.length > 0) {
                // Fallback to embedded sessions if API returns empty but data has them
                this.processSessions(data);
              }
              this.loadingSessions = false;
            },
            error: (err) => {
              console.error('Failed to load sessions:', err);
              // Fallback to embedded sessions if available
              if (data.sessions && data.sessions.length > 0) {
                this.processSessions(data);
              }
              this.loadingSessions = false;
            }
          });
        } else if (data.sessions && data.sessions.length > 0) {
          this.processSessions(data);
        }

        // Calculate percentage if missing
        const total = data.progress?.total || data.course?.totalLectures || 0;
        const completed = data.enrollment?.completedLectures?.length || 0;
        if (total > 0 && (!data.progress?.percentage || data.progress.percentage === 0)) {
          data.progress.percentage = Math.round((completed / total) * 100);
        }

        this.courseData = data as EnrolledCourseData;
        this.loading = false;

        // Fetch full course details for instructor + duration
        this.coursesService.getSingleCourseStudentSide(courseId).subscribe({
          next: (fullRes: any) => {
            if (fullRes.success && fullRes.data && this.courseData) {
              const fullCourse = fullRes.data.course;

              const instructors = fullCourse.instructors || [];
              const assignedInstructors = fullCourse.assignedInstructors || [];

              if (instructors.length > 0) {
                const head = instructors[0];
                const parts = (head.name || '').split(' ');
                this.courseData.course.instructor = {
                  ...this.courseData.course.instructor,
                  firstName: parts[0] || '',
                  lastName: parts.slice(1).join(' ') || '',
                  profilePicture: head.profilePicture
                };
              } else if (assignedInstructors.length > 0 && assignedInstructors[0].instructor) {
                const head = assignedInstructors[0].instructor;
                this.courseData.course.instructor = {
                  ...this.courseData.course.instructor,
                  firstName: head.firstName,
                  lastName: head.lastName,
                  profilePicture: head.profilePicture?.secureUrl || head.profilePicture
                };
              }

              if (fullCourse.courseOverview?.courseDuration) {
                this.courseData.course.duration = fullCourse.courseOverview.courseDuration;
              }
            }
          },
          error: (err: any) => console.error('Failed to load full course metadata:', err)
        });
      },
      error: (err: any) => {
        console.error('Failed to load course data:', err);

        // Double check status using the specific endpoint if possible
        this.enrollmentService.checkEnrollmentStatus(courseId).subscribe({
          next: (statusRes) => {
            if (!statusRes.isEnrolled) {
              this.error = 'User is not enrolled in this course.';
            } else {
              this.error = 'Your enrollment for this course is still pending approval. Please check back once it is approved.';
            }
            this.loading = false;
          },
          error: () => {
            this.error = 'Failed to load course data. Please try again later.';
            this.loading = false;
          }
        });
      }
    });
  }

  toggleLessonModule(moduleIndex: number): void {
    this.openLessonModule = this.openLessonModule === moduleIndex ? null : moduleIndex;
  }

  isCompleted(lectureId: string): boolean {
    return this.courseData?.enrollment?.completedLectures?.includes(lectureId) || false;
  }

  isActive(lectureId: string): boolean {
    if (!this.courseData?.modules) return false;

    for (const module of this.courseData.modules as any[]) {
      if (module.lectures) {
        for (const lecture of module.lectures) {
          if (!this.isCompleted(lecture._id)) {
            return lecture._id === lectureId;
          }
        }
      }
    }
    return false;
  }

  get courseProgress(): number {
    if (!this.courseData?.modules || this.courseData.modules.length === 0) {
      return this.courseData?.progress?.percentage || 0;
    }

    const modules = this.courseData.modules as any[];
    const total = modules.length;
    const completed = modules.filter(m => m.completed || m.studentCompleted).length;

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  getLectureClass(lectureId: string): string {
    if (this.isCompleted(lectureId)) {
      return 'border-[#86EFAC] bg-[#DCFCE7]';
    }
    if (this.isActive(lectureId)) {
      return 'border-[#7DD3FC] bg-[#E0F2FE]';
    }
    return 'border-gray-200 bg-white';
  }

  getModuleClass(module: any): string {
    if (module.studentCompleted || module.completed) {
      return 'border-[#86EFAC] bg-[#DCFCE7]';
    }
    // Logic for 'active' module could be refined, but for now fallback to white
    return 'border-gray-200 bg-white';
  }

  getClassDays(): string {
    if (!this.courseData?.sessions || this.courseData.sessions.length === 0) {
      return 'Mon - Friday'; // Default fallback
    }
    const sessionDays = new Set<number>();
    this.courseData.sessions.forEach((s: any) => {
      if (s.sessionDate) {
        const date = new Date(s.sessionDate);
        if (!isNaN(date.getTime())) {
          sessionDays.add(date.getDay());
        }
      }
    });

    if (sessionDays.size === 0) return 'Mon - Friday';

    const sortedDays = Array.from(sessionDays).sort((a, b) => a - b);

    // Check if it's Mon-Fri (1, 2, 3, 4, 5)
    const isMonFri = sortedDays.length === 5 && sortedDays[0] === 1 && sortedDays[4] === 5;
    if (isMonFri) return 'Mon - Friday';

    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return sortedDays.map(d => shortDays[d]).join(', ');
  }

  private processSessions(data: any): void {
    if (!data.sessions || data.sessions.length === 0) return;

    const now = new Date();
    this.upcomingSession = data.sessions
      .filter((s: any) => {
        const sessionDate = new Date(`${s.sessionDate}T${s.startTime}`);
        return sessionDate > now && s.sessionStatus !== 'completed' && s.sessionStatus !== 'canceled';
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(`${a.sessionDate}T${a.startTime}`).getTime();
        const dateB = new Date(`${b.sessionDate}T${b.startTime}`).getTime();
        return dateA - dateB;
      })[0] || null;

    if (!this.upcomingSession) {
      this.upcomingSession =
        data.sessions.find((s: any) => s.sessionStatus === 'scheduled') || data.sessions[0];
    }

    if (this.upcomingSession && !this.upcomingSession.course) {
      this.upcomingSession.course = {
        _id: data.course?._id || '',
        courseTitle: data.course?.title || ''
      };
    }
  }

  /**
   * Load quizzes for the current course
   */
  private loadQuizzes(courseId: string): void {
    this.loadingQuizzes = true;

    // Fetch quizzes and attempts concurrently
    this.quizService.getAvailableQuizzes(courseId).subscribe({
      next: (quizzes) => {
        this.courseQuizzes = quizzes || [];

        // Fetch attempts for these quizzes
        this.quizService.getAttempts({ courseId }).subscribe({
          next: (attempts) => {
            this.quizAttempts = attempts || [];
            this.loadingQuizzes = false;
          },
          error: (err) => {
            console.error('Failed to load quiz attempts:', err);
            this.quizAttempts = [];
            this.loadingQuizzes = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load quizzes:', err);
        this.courseQuizzes = [];
        this.loadingQuizzes = false;
      }
    });
  }

  /**
   * Get quizzes for a specific module
   */
  getQuizzesForModule(moduleId: string): Quiz[] {
    if (!this.courseQuizzes || this.courseQuizzes.length === 0) {
      return [];
    }

    return this.courseQuizzes.filter(quiz => {
      const quizModuleId = (quiz.module as any)?._id || quiz.module;
      return quizModuleId === moduleId;
    });
  }

  /**
   * Get quiz status (Not Started / In Progress / Completed)
   */
  getQuizStatus(quizId: string): string {
    if (!this.quizAttempts || this.quizAttempts.length === 0) {
      return 'Not Started';
    }

    const attempts = this.quizAttempts.filter(a => a.quizId === quizId || false /*quiz property removed*/);

    if (attempts.length === 0) return 'Not Started';

    // Check if any attempt is completed
    const completedAttempt = attempts.find(a => a.status === 'completed' || a.status === 'submitted');
    if (completedAttempt) return 'Completed';

    // Check if any attempt is in progress
    const inProgressAttempt = attempts.find(a => a.status === 'in_progress' || a.status === 'not_started');
    if (inProgressAttempt) return 'In Progress';

    return 'Not Started';
  }

  /**
   * Get quiz action button text
   */
  getQuizActionText(quizId: string): string {
    const status = this.getQuizStatus(quizId);

    switch (status) {
      case 'Completed':
        return 'View Result';
      case 'In Progress':
        return 'Continue';
      default:
        return 'Start';
    }
  }

  /**
   * Handle quiz action (Start / Continue / View Result)
   */
  handleQuizAction(quiz: any): void {
    const quizId = quiz._id || quiz.id;
    const status = this.getQuizStatus(quizId);

    if (!quizId) {
      console.error('Missing quizId');
      return;
    }

    switch (status) {
      case 'Completed':
        // Navigate to results - find the completed attempt
        const completedAttempt = this.quizAttempts.find(a =>
          a.quizId === quizId &&
          (a.status === 'completed' || a.status === 'submitted')
        );
        if (completedAttempt) {
          // Route: /student/view-quizresults?attemptId=xxx
          this.router.navigate(['/student/view-quizresults'], {
            queryParams: { attemptId: completedAttempt.attemptId }
          });
        }
        break;

      case 'In Progress':
        // Navigate to attempt - find the in-progress attempt
        const inProgressAttempt = this.quizAttempts.find(a =>
          a.quizId === quizId &&
          a.status === 'in_progress'
        );
        if (inProgressAttempt) {
          // Route: /student/attempt-quiz?quizId=xxx (resume attempt)
          this.router.navigate(['/student/attempt-quiz'], {
            queryParams: { quizId: quizId }
          });
        }
        break;

      default:
        // Navigate to attempt page to start new quiz
        // Route: /student/attempt-quiz?quizId=xxx
        this.router.navigate(['/student/attempt-quiz'], {
          queryParams: { quizId: quizId }
        });
        break;
    }
  }
}


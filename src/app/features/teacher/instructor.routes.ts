// app-routing.module.ts OR your routes file
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/steam-mind/auth.guard';
import { roleGuard } from '../../core/guards/steam-mind/role.guard';
export const instructor: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard(['instructor'])], // ✅
     canActivateChild: [authGuard, roleGuard(['instructor'])],
    loadComponent: () =>
      import('./pages/instructor-home/instructor-home.component').then(
        (m) => m.InstructorHomeComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/dashboard/dashboard.component').then(
                (m) => m.DashboardComponent
              ),
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import(
                './components/notification-list/notification-list.component'
              ).then((m) => m.NotificationListComponent),
          },
          {
            path: 'feedback',
            loadComponent: () =>
              import('./components/feedback/feedback.component').then(
                (m) => m.FeedbackComponent
              ),
          },
        ],
      },
      //course management routes
      {
        path: 'courses',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './pages/instructor-courses/instructor-courses.component'
              ).then((m) => m.InstructorCoursesComponent),
          },
          {
            path: 'course/:id',
            loadComponent: () =>
              import(
                './components/courses-detail/courses-detail.component'
              ).then((m) => m.CoursesDetailComponent),
          },
        ],
      },
      //quiz management routes
      {
        path: 'instructor-quiz',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './pages/instructor-quiz-management/instructor-quiz-management.component'
              ).then((m) => m.InstructorQuizManagementComponent),
          },
          {
            path: 'quiz-overview/:id',
            loadComponent: () =>
              import('./components/quiz-overview/quiz-overview.component').then(
                (m) => m.QuizOverviewComponent
              ),
          },
          {
            path: 'create-quiz',
            loadComponent: () =>
              import('./components/create-quiz/create-quiz.component').then(
                (m) => m.CreateQuizComponent
              ),
          },
          {
            path: 'create-ai-quiz',
            loadComponent: () =>
              import(
                './components/create-ai-generated-quiz/create-ai-generated-quiz.component'
              ).then((m) => m.CreateAiGeneratedQuizComponent),
          },
          {
            path: 'create-manual-quiz',
            loadComponent: () =>
              import(
                './components/create-manual-quiz/create-manual-quiz.component'
              ).then((m) => m.CreateManualQuizComponent),
          },
          {
            path: 'edit-quiz/:id',
            loadComponent: () =>
              import('./components/edit-quiz/edit-quiz.component').then(
                (m) => m.EditQuizComponent
              ),
          },
          {
            path: 'view-student-quiz',
            loadComponent: () =>
              import(
                './components/student-quiz-view/student-quiz-view.component'
              ).then((m) => m.StudentQuizViewComponent),
          },
        ],
      },
      //session management routes
      {
        path: 'manage-sessions',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './pages/manage-sessions/manage-sessions.component'
              ).then((m) => m.ManageSessionsComponent),
          },
          {
            path: 'session-detail',
            loadComponent: () =>
              import(
                './components/session-detail/session-detail.component'
              ).then((m) => m.SessionDetailComponent),
          },
          {
  path: 'session-manage/:sessionId',
  loadComponent: () =>
    import('./components/new-session-detail/new-session-detail.component')
      .then((m) => m.NewSessionDetailComponent),
},

        ],
      },
      //availability and profile routes
      {
        path: 'set-availability',
        loadComponent: () =>
          import(
            './pages/set-availability/set-availability.component'
          ).then((m) => m.SetAvailabilityComponent),
      },
      //profile routes
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/profile/profile.component').then(
                (m) => m.ProfileComponent
              ),
          },
          {
            path: 'edit-profile',
            loadComponent: () =>
              import('./components/edit-profile/edit-profile.component').then(
                (m) => m.EditProfileComponent
              ),
          },
          {
            path: 'student-profile',
            loadComponent: () =>
              import(
                './components/student-profile/student-profile.component'
              ).then((m) => m.StudentProfileComponent),
          },
          {
            path: 'student-report/:id',
            loadComponent: () =>
              import(
                './components/student-progress-report/student-progress-report.component'
              ).then((m) => m.StudentProgressReportComponent),
          },
          {
            path: 'student-report',
            loadComponent: () =>
              import(
                './components/student-progress-report/student-progress-report.component'
              ).then((m) => m.StudentProgressReportComponent),
          },
        ],
      },
    ],
  },
];


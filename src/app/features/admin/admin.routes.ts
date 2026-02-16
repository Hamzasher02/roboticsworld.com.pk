import { Routes } from '@angular/router';
import { adminAuthGuard, adminAuthChildGuard } from '../../core/guards/admin/admin-auth.guard';
import { adminGuestGuard } from '../../core/guards/admin/admin-guest.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [adminGuestGuard],
    loadComponent: () =>
      import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'forget-password',
    canActivate: [adminGuestGuard],
    loadComponent: () =>
      import('./components/forget-password/forget-password.component').then(
        (m) => m.ForgetPasswordComponent
      ),
  },
  {
    path: '',
    canActivate: [adminAuthGuard],
    canActivateChild: [adminAuthChildGuard],
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
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
            path: 'course-popularity-analytics',
            loadComponent: () =>
              import(
                './components/course-popularity-analytics/course-popularity-analytics.component'
              ).then((m) => m.CoursePopularityAnalyticsComponent),
          },

          {
            path: 'instructor-performance-analytics',
            loadComponent: () =>
              import(
                './components/instructor-performance-analytics/instructor-performance-analytics.component'
              ).then((m) => m.InstructorPerformanceAnalyticsComponent),
          },

          {
            path: 'student-engagement-analytics',
            loadComponent: () =>
              import(
                './components/student-engagement-analytics/student-engagement-analytics.component'
              ).then((m) => m.StudentEngagementAnalyticsComponent),
          },
        ],
      },
      {
        path: 'manage-user',
        children: [
          // ✅ /admin/manage-user  => UserManagerComponent load
          {
            path: '',
            loadComponent: () =>
              import('./pages/user-manager/user-manager.component').then(
                (m) => m.UserManagerComponent
              ),
          },

          // ✅ /admin/manage-user/instructor-profile/:email
          {
            path: 'instructor-profile/:email',
            loadComponent: () =>
              import('./components/manage-user/profile/profile.component').then(
                (m) => m.ProfileComponent
              ),
          },

          // ✅ /admin/manage-user/student-profile/:email
          {
            path: 'student-profile/:email',
            loadComponent: () =>
              import(
                './components/manage-user/student-profile/student-profile.component'
              ).then((m) => m.StudentProfileComponent),
          },
        ],
      },
      {
        path: 'course-management',
        children: [
          // ✅ /admin/course-management  => CourseManagementComponent load
          {
            path: '',
            loadComponent: () =>
              import(
                './pages/course-management/course-management.component' // load component
              ).then((m) => m.CourseManagementComponent),
          },

          // ✅ /admin/course-management/view-category - Route
          {
            path: 'view-category',
            loadComponent: () =>
              import(
                './components/course-management/view-categories/view-categories.component'
              ).then((m) => m.ViewCategoriesComponent),
          },

          // ✅ /admin/course-management/course-detail
          {
            path: 'course-detail',
            loadComponent: () =>
              import(
                './components/course-management/course-details/course-details.component'
              ).then((m) => m.CourseDetailsComponent),
          },
        ],
      },
      {
        path: 'quiz-management',
        loadComponent: () =>
          import('./pages/quiz-management/quiz-management.component').then(
            (m) => m.QuizManagementComponent
          ),
      },
      {
        path: 'manage-request',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/manage-request/manage-request.component').then(
                (m) => m.ManageRequestComponent
              ),
          },
          {
            path: 'demo-session/:id',
            loadComponent: () =>
              import(
                './components/manage-session/demo-session/demo-session.component'
              ).then((m) => m.DemoSessionComponent),
          },
          {
            path: 'live-session/:id',
            loadComponent: () =>
              import(
                './components/manage-session/live-session/live-session.component'
              ).then((m) => m.LiveSessionComponent),
          },
        ],
      },
      {
        path: 'manage-purchases',
        loadComponent: () =>
          import('./pages/manage-purchase/manage-purchase.component').then(
            (m) => m.ManagePurchaseComponent
          ),
      },
      {
        path: 'activity-log',
        loadComponent: () =>
          import('./pages/activity-log/activity-log.component').then(
            (m) => m.ActivityLogComponent
          ),
      },
      {
        path: 'delete-history',
        loadComponent: () =>
          import('./pages/delete-history/delete-history.component').then(
            (m) => m.DeleteHistoryComponent
          ),
      },
      {
        path: 'student-progress',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './pages/student-progress/student-progress.component'
              ).then((m) => m.StudentProgressComponent),
          },
          {
            path: 'student-progress-report/:id',
            loadComponent: () =>
              import(
                './pages/student-progress-report/student-progress-report.component'
              ).then((m) => m.StudentProgressReportComponent),
          },
        ],
      },
      {
        path: 'coming-soon/:module',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(
            (m) => m.ComingSoonComponent
          ),
      },
      {
        path: 'generate-report',
        loadComponent: () =>
          import('./pages/generate-report/generate-report.component').then(
            (m) => m.GenerateReportComponent
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },


];

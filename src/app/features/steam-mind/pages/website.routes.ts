import { Routes } from '@angular/router';
import { guestGuard } from '../../../core/guards/steam-mind/guest.guard';

export const websiteRouting: Routes = [
  {
    path: '',
    // ✅ Block logged-in users from accessing steam-mind pages
    // They will be redirected to their role-based dashboard
    canActivate: [guestGuard],
    canActivateChild: [guestGuard],
    loadComponent: () =>
      import('./website-routing/website-routing.component').then(
        (m) => m.WebsiteRoutingComponent
      ),

    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '../components/steam-mind-home/steam-mind-home.component'
          ).then((m) => m.SteamMindHomeComponent),
      },


      {
        path: 'summercamp',
        loadComponent: () =>
          import('./summer-camp/summer-camp.component').then(
            (m) => m.SummerCampComponent
          ),
      },
      {
        path: 'wintercamp',
        loadComponent: () =>
          import('./winter-camp/winter-camp.component').then(
            (m) => m.WinterCampComponent
          ),
      },
      {
        path: 'campform',
        loadComponent: () =>
          import('../components/camps-form/camps-form.component').then(
            (m) => m.CampsFormComponent
          ),
      },
      {
        path: 'contactus',
        loadComponent: () =>
          import('../components/contact-us/contact-us.component').then(
            (m) => m.ContactUsComponent
          ),
      },
      {
        path: 'aboutus',
        loadComponent: () =>
          import('../components/about-us/about-us.component').then(
            (m) => m.AboutUsComponent
          ),
      },
      {
        path: 'aboutus-detail',
        loadComponent: () =>
          import('../components/about-us-detail/about-us-detail.component').then(
            (m) => m.AboutUsDetailComponent
          ),
      },
      {
        path: 'productandservices',
        loadComponent: () =>
          import('./product-services/product-services.component').then(
            (m) => m.ProductServicesComponent
          ),
      },
      {
        path: 'course-detail',
        loadComponent: () =>
          import('../components/course-detail-page/course-detail-page.component')
            .then((m) => m.CourseDetailPageComponent),
      },
      {
        path: 'course',
        loadComponent: () =>
          import('../components/courses/courses.component')
            .then((m) => m.CoursesComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('../components/login/login.component')
            .then((m) => m.LoginComponent),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('../components/signup/signup.component')
            .then((m) => m.SignupComponent),
      },
      {
        path: 'forget-password',
        loadComponent: () =>
          import('../components/forget-password/forget-password.component')
            .then((m) => m.ForgetPasswordComponent),
      },
      {
        path: 'choose-role',
        loadComponent: () =>
          import('../components/choose-role/choose-role.component')
            .then((m) => m.ChooseRoleComponent),
      },
      {
        path: 'student-profile',
        loadComponent: () =>
          import('../components/student-profile/student-profile.component')
            .then((m) => m.StudentProfileComponent),
      },
      {
        path: 'teacher-profile',
        loadComponent: () =>
          import('../components/teacher-profile/edit-profile.component')
            .then((m) => m.EditProfileComponent),
      },
      {
        path: 'competition',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./competition/competition.component').then(
                (m) => m.CompetitionComponent
              ),
          },
          {
            path: 'competition-form',
            loadComponent: () =>
              import(
                '../components/competition-form/competition-form.component'
              ).then((m) => m.CompetitionFormComponent),
          },
          {
            path: 'competition-details',
            loadComponent: () =>
              import(
                '../components/view-competition/view-competition.component'
              ).then((m) => m.ViewCompetitionComponent),
          },
        ],
      },
      {
        path: 'blog',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./blog/blog.component').then((m) => m.BlogComponent),
          },
          {
            path: 'detail/:id',
            loadComponent: () =>
              import('../components/blog-detail/blog-detail.component').then(
                (m) => m.BlogDetailComponent
              ),
          },
        ],
      },
    ]
  }

];

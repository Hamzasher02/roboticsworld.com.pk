
import { Routes } from '@angular/router';
import { ADMIN_SECRET_PATH } from './core/config/admin-routes.config';

export const routes: Routes = [
  {
    path: "steam-mind",
    loadChildren: () =>
      import('./features/steam-mind/pages/website.routes').then((m) => m.websiteRouting),
  },
  {
    path: 'student',
    loadChildren: () =>
      import('./features/student/pages/student.routes').then((m) => m.studentRouting),
  },

  {
    path: 'instructor',
    loadChildren: () =>
      import('./features/teacher/instructor.routes').then((m) => m.instructor),
  },

  {
    // 🔒 Secret admin path - only accessible to those who know the exact URL
    path: ADMIN_SECRET_PATH,
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: 'steam-mind' },
];

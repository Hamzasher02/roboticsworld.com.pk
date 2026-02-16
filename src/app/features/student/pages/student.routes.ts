import { Routes } from "@angular/router";
import { roleGuard } from '../../../core/guards/steam-mind/role.guard';

export const studentRouting: Routes = [
    {
        path: '',
        canActivate: [roleGuard(['student'])],
        canActivateChild: [roleGuard(['student'])],
        loadComponent: () =>
            import('./sudent-routing/routing.component')
                .then((m) => m.RoutingComponent),

        children: [
            {
                path: '',
                loadComponent: () =>
                    import('../components/dashboard/dashboard.component')
                        .then((m) => m.DashboardComponent),
            },
            {
                path: 'courses',
                loadComponent: () =>
                    import('../components/courses/courses.component')
                        .then((m) => m.CoursesComponent),
            },
            {
                path: 'messages',
                loadComponent: () =>
                    import('../components/message/message.component')
                        .then((m) => m.MessageComponent),
            },
            {
                path: 'forum',
                loadComponent: () =>
                    import('../components/forum/forum.component')
                        .then((m) => m.ForumComponent),
            },
            {
                path: 'quiz',
                loadComponent: () =>
                    import('../components/quiz/quiz.component')
                        .then((m) => m.QuizComponent),
            },
            {
                path: 'wishlist',
                loadComponent: () =>
                    import('../components/wishlist/wishlist.component')
                        .then((m) => m.WishlistComponent),
            },
            {
                path: 'settings',
                loadComponent: () =>
                    import('../components/settings/settings.component')
                        .then((m) => m.SettingsComponent),
            },
            {
                path: 'live-sessions/:id',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/enrolled-courses-detail/enrolled-courses-detail.component')
                        .then((m) => m.EnrolledCoursesDetailComponent),
                children: [
                    {
                        path: 'course-feedback',
                        data: { hideStudentHeader: true },
                        loadComponent: () =>
                            import('../components/courses-feedback/courses-feedback.component')
                                .then((m) => m.CoursesFeedbackComponent),
                    },
                    {
                        path: 'generate-certificate',
                        data: { hideStudentHeader: true },
                        loadComponent: () =>
                            import('../components/generate-certificate/generate-certificate.component')
                                .then((m) => m.GenerateCertificateComponent),
                    },

                    {
                        path: 'name-correction',
                        data: { hideStudentHeader: true },
                        loadComponent: () =>
                            import('../components/name-correction/name-correction.component')
                                .then((m) => m.NameCorrectionComponent),
                    },
                ]
            },
            {
                path: 'recorded-sessions/:id',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/recorded-sessions/recorded-sessions.component')
                        .then((m) => m.RecordedSessionsComponent),
                children: [
                    {
                        path: 'course-feedback',
                        data: { hideStudentHeader: true },
                        loadComponent: () =>
                            import('../components/courses-feedback/courses-feedback.component')
                                .then((m) => m.CoursesFeedbackComponent),
                    },
                    {
                        path: 'generate-certificate',
                        data: { hideStudentHeader: true },
                        loadComponent: () =>
                            import('../components/generate-certificate/generate-certificate.component')
                                .then((m) => m.GenerateCertificateComponent),
                    },
                    {
                        path: 'name-correction',
                        data: { hideStudentHeader: true },
                        loadComponent: () =>
                            import('../components/name-correction/name-correction.component')
                                .then((m) => m.NameCorrectionComponent),
                    },
                ]
            },
            {
                path: 'view-course/:id',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/view-course/view-course.component')
                        .then((m) => m.ViewCourseComponent),
            },
            {
                path: 'view-upcomming-sessions',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/courses-demo/courses-demo.component')
                        .then((m) => m.CoursesDemoComponent),
                children: [
                    {
                        path: 'view-session-detail/:id',
                        data: { hideStudentHeader: true },
                        loadComponent: () =>
                            import('../components/session-detail-demo/session-detail-demo.component')
                                .then(m => m.SessionDetailDemoComponent),
                    },
                ]
            },

            {
                path: 'request-course-demo',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/demo-request-time/demo-request-time.component')
                        .then((m) => m.DemoRequestTimeComponent),
            },

            {
                path: 'buy-course',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/buy-course-component/buy-course-component.component')
                        .then((m) => m.BuyCourseComponentComponent),
            },

            {
                path: 'select-time',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/select-class-time/select-class-time.component')
                        .then((m) => m.SelectClassTimeComponent),
            },

            {
                path: 'recorded-course-video/:id',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/recorded-course-video/recorded-course-video.component')
                        .then((m) => m.RecordedCourseVideoComponent),
            },

            //Forum
            {
                path: 'start-discussion',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/forum-start-discussion/forum-start-discussion.component')
                        .then((m) => m.ForumStartDiscussionComponent),
            },
            {
                path: 'get-help',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/forum-get-help/forum-get-help.component')
                        .then((m) => m.ForumGetHelpComponent),
            },
            {
                path: 'share-resources',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/share-resources/share-resources.component')
                        .then((m) => m.ShareResourcesComponent),
            },
            {
                path: 'join-live-session',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/live-sessions/live-sessions.component')
                        .then((m) => m.LiveSessionsComponent),
            },

            // get help inner pages routing
            {
                path: 'study-help',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/study-help/study-help.component')
                        .then((m) => m.StudyHelpComponent),
            },
            {
                path: 'peer-mentoring',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/peer-meeting/peer-meeting.component')
                        .then((m) => m.PeerMeetingComponent),
            },

            {
                path: 'question-detail',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/question-detail/question-detail.component')
                        .then((m) => m.QuestionDetailComponent),
            },


            // course Demo
            {
                path: 'request-course-demo/:id',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/demo-request-time/demo-request-time.component')
                        .then((m) => m.DemoRequestTimeComponent),
            },

            // quiz
            {
                path: 'attempt-quiz',
                data: { hideStudentHeader: true, fullscreen: true },
                loadComponent: () =>
                    import('../components/attempt-quiz/attempt-quiz.component')
                        .then((m) => m.AttemptQuizComponent),
            },
            {
                path: 'view-quizresults',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/view-quiz-results/view-quiz-results.component')
                        .then((m) => m.ViewQuizResultsComponent),
            },

            // wishlist routing
            {
                path: 'checkout',
                data: { hideStudentHeader: true },
                loadComponent: () =>
                    import('../components/check-out/check-out.component')
                        .then((m) => m.CheckOutComponent),
            },

        ],
    },


]

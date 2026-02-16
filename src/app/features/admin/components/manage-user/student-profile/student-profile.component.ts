import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getAdminBasePath } from '../../../../../core/config/admin-routes.config';

interface LiveSession {
  course: string;
  module: string;
  session: string;
  instructor: string;
  date: string;
  time: string;
}

interface EnrolledCourse {
  title: string;
  instructor: string;
  progress: number;
  status: 'Pending' | 'Completed';
}

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-profile.component.html',
})
export class StudentProfileComponent {
  email!: string | null;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.email = this.route.snapshot.paramMap.get('email');
  }


  goBack() {
    this.router.navigate([`${getAdminBasePath()}/manage-user`]);
  }

  student = {
    name: 'John Doe',
    id: 'ID-STD-123',
    status: 'Active',
    level: 'Advanced',
    avatar: '/assets/admin/Admin.svg',
  };

  profile = {
    email: 'johndoe23@gmail.com',
    phone: '+9234568902',
    location: '123 Main street, Apt 4B',
    ageGroup: 'Grade 4',
    course: 'Mental Maths',
    level: 'Advanced',
  };

  plan = {
    type: 'Live Sessions',
    enrollmentDate: 'Feb 5, 2025',
    expiryDate: 'July 5, 2025',
    duration: '5 Months',
  };

  upcomingSessions: LiveSession[] = [
    {
      course: 'Mental Maths',
      module: 'Intro to Maths',
      session: 'Session 1',
      date: 'May 28, 2025',
      time: '10:00am - 11:30am',
      instructor: 'David Miller',
    },
  ];

  enrolledCourses: EnrolledCourse[] = [
    { title: 'Advanced JavaScript', instructor: 'David Miller', progress: 20, status: 'Pending' },
    { title: 'Advanced JavaScript', instructor: 'David Miller', progress: 20, status: 'Pending' },
    { title: 'Advanced JavaScript', instructor: 'David Miller', progress: 20, status: 'Completed' },
  ];
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getAdminBasePath } from '../../../../../core/config/admin-routes.config';

interface TimeSlot {
  start: string;
  end: string;
}

interface Availability {
  day: string;
  slots?: TimeSlot[];
  notAvailable?: boolean;
}
@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  // Static data (kept in TS as requested)

  title = 'Instructor Profile';
  email!: string | null;


  ngOnInit() {
    this.email = this.route.snapshot.paramMap.get('email');
  }
  instructor = {
    name: 'David Miller',
    id: 'ID-INS-123',
    status: 'Active',
    avatarUrl: '/assets/admin/Admin.svg'
  };

  profile = {
    email: 'johndoe23@gmail.com',
    phone: '+9234568902',
    location: '123 Main street, Apt 4B',
    totalStudents: 20,
    joinedDate: 'May 28, 2025',
  };

  availability: Availability[] = [
    {
      day: 'Monday',
      slots: [
        { start: '10:00', end: '11:00' },
        { start: '14:00', end: '15:00' },
      ],
    },
    {
      day: 'Tuesday',
      slots: [
        { start: '10:00', end: '11:00' },
        { start: '14:00', end: '15:00' },
      ],
    },
    {
      day: 'Wednesday',
      slots: [
        { start: '10:00', end: '11:00' },
        { start: '14:00', end: '15:00' },
      ],
    },
    {
      day: 'Thursday',
      slots: [
        { start: '10:00', end: '11:00' },
        { start: '14:00', end: '15:00' },
      ],
    },
    {
      day: 'Friday',
      slots: [
        { start: '10:00', end: '11:00' },
        { start: '14:00', end: '15:00' },
      ],
    },
    {
      day: 'Saturday',
      notAvailable: true,
    },
    {
      day: 'Sunday',
      notAvailable: true,
    },
  ];
  liveSessions = [
    {
      title: 'Mental Maths',
      level: 'Advanced',
      student: 'John Doe',
      module: 2,
      date: 'May 21, 2025',
      time: '10:00 - 11:00',
      status: 'Upcoming',
      statusClass: 'bg-[#FFCA2833] text-[#FFCA28] border-orange-100'
    },
    {
      title: 'Mental Maths',
      level: 'Advanced',
      student: 'John Doe',
      module: 1,
      date: 'May 20, 2025',
      time: '10:00 - 11:00',
      status: 'Completed',
      statusClass: 'bg-[#22C55E33] text-[#22C55E] border-green-100'
    }
  ];

  assignedCourses = [
    { title: 'Advanced Mental Maths', sessions: 12, students: 5 },
    { title: 'Basic Mental Maths', sessions: 12, students: 5 },
    { title: 'Intermediate Mental Maths', sessions: 12, students: 5 }
  ];
  uploads = [
    { name: 'Final Project.pdf', date: 'May 20, 2025' },
    { name: 'Assignment 3.pdf', date: 'May 10, 2025' },
    { name: 'Assignment 2.pdf', date: 'May 05, 2025' },
    { name: 'Assignment 1.pdf', date: 'May 03, 2025' }
  ];

  expertises = [
    { subject: 'Arithmetic', level: 'Basic' },
    { subject: 'Algebra', level: 'Basic' },
    { subject: 'Mental Math Techniques', level: 'Basic' },
    { subject: 'Mathematical Problem Solving', level: 'Basic' },
    { subject: 'Arithmetic', level: 'Basic' },
    { subject: 'Estimation', level: 'Basic' },
    { subject: 'Remedial Math Instruction', level: 'Basic' },
    { subject: 'Arithmetic', level: 'Basic' },
    { subject: 'Arithmetic', level: 'Basic' },
    { subject: 'Arithmetic', level: 'Basic' },
    { subject: 'Arithmetic', level: 'Basic' },
    { subject: 'Arithmetic', level: 'Basic' },
    { subject: 'Arithmetic', level: 'Basic' },
    { subject: 'Geometry', level: 'Basic' },
    { subject: 'MentalMath', level: 'Basic' }
  ];

  overallRating = 4.8;

  reviews = [
    {
      name: 'John Doe',
      date: 'May 12, 2025',
      rating: 4,
      comment:
        'I found the session very informative and easy to follow. The practical exercises helped me grasp the concepts better.'
    },
    {
      name: 'Emily Johnson',
      date: 'May 14, 2025',
      rating: 5,
      comment:
        'Excellent session! The instructor explained complex concepts in a simple manner.'
    },
    {
      name: 'Michael Smith',
      date: 'May 18, 2025',
      rating: 4,
      comment:
        'Very helpful session, especially the examples and problem-solving approach.'
    }
  ];

  getStatusClass(status: string) {
    return status === 'Completed'
      ? 'bg-green-100 text-green-600 border-green-200'
      : 'bg-yellow-100 text-yellow-600 border-yellow-200';
  }
  // UI controls
  actionButton = {
    label: 'Inactive'
  };
  constructor(private router: Router, private route: ActivatedRoute) { }
  goBack() {
    this.router.navigate([`${getAdminBasePath()}/manage-user`]);
  }
}
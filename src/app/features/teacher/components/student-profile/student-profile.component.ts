import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type CourseStatus = 'Pending' | 'Completed';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.css',
})
export class StudentProfileComponent {
    constructor(private router: Router) {}

   goBackToProfile() {
    this.router.navigate(['/instructor/profile']);
  }
  student = {
    name: 'John Doe',
    id: 'ID-STD-123',
    grade: 'Grade 11',
    age: 'Age 17 yrs',
    email: 'johndoe23@gmail.com',
    phone: '+9234568902',
    location: '123 Main street, Apt 4B',
    avatar: 'assets/instructor-images/profile/Avatar.svg',
  };

  courses: Array<{
    title: string;
    status: CourseStatus;
    progress: number;
  }> = [
    { title: 'Advanced JavaScript', status: 'Pending', progress: 20 },
    { title: 'Advanced JavaScript', status: 'Completed', progress: 20 },
  ];

  liveSession = {
    title: 'Mental Maths',
    subtitle: 'Intro to Maths',
    date: 'May 28, 2025',
    time: '10:00am - 11:30 am',
  };

  assignments = [
    {
      assignment: 'Calculus Problem Set 5',
      course: 'Advanced Mathematics',
      status: 'Submitted',
      grade: 'A+',
      dueDate: 'May 28, 2025',
    },
    {
      assignment: 'Math Quiz - Derivatives',
      course: 'Advanced Mathematics',
      status: 'Pending',
      grade: 'Not Graded',
      dueDate: 'May 28, 2025',
    },
  ];
}

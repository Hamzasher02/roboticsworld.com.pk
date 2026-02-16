import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink } from '@angular/router';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';

import { StudentProgressService, StudentProgressItem } from '../../../../core/services/admin/student-progress/student-progress.service';

type PlanFilter = 'Filter by Plan' | 'Basic' | 'Standard' | 'Premium';
type CourseFilter = 'Filter by course' | 'Python Level 1' | 'Python Level 2' | 'Web Development';

type StudentRow = {
  id: string; // studentId
  name: string;
  email: string;
  course: string;
  subscription: string;
  enrollmentDate: string;
  progress: number;
};

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-progress.component.html',
  styleUrl: './student-progress.component.css',
})
export class StudentProgressComponent implements OnInit {
  basePath = getAdminBasePath();
  // Filters
  plan: string = 'Filter by Plan';
  course: string = 'Filter by course';

  planOptions: string[] = ['Filter by Plan', 'Basic', 'Standard', 'Premium'];
  courseOptions: string[] = ['Filter by course', 'Python Level 1', 'Python Level 2', 'Web Development'];

  rows: StudentRow[] = [];
  isLoading = false;

  constructor(private studentProgressService: StudentProgressService) { }

  ngOnInit(): void {
    this.fetchProgress();
  }

  fetchProgress() {
    this.isLoading = true;
    this.studentProgressService.getAllStudentProgress().subscribe({
      next: (res) => {
        if (res.success) {
          this.rows = res.data.map(this.mapToRow);

          // Dynamic Course Options
          const uniqueCourses = Array.from(new Set(this.rows.map(r => r.course)));
          this.courseOptions = ['Filter by course', ...uniqueCourses];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching progress:', err);
        this.isLoading = false;
      }
    });
  }

  private mapToRow(item: StudentProgressItem): StudentRow {
    return {
      id: item.studentId,
      name: item.studentName,
      email: item.email,
      course: item.courseTitle,
      subscription: item.subscription ? item.subscription.charAt(0).toUpperCase() + item.subscription.slice(1) : '',
      enrollmentDate: new Date(item.enrollmentDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      progress: item.progressPercentage
    };
  }

  get filteredRows(): StudentRow[] {
    let list = [...this.rows];

    if (this.plan !== 'Filter by Plan') {
      list = list.filter((r) => r.subscription.toLowerCase() === this.plan.toLowerCase()); // Case insensitive check just in case
    }

    if (this.course !== 'Filter by course') {
      list = list.filter((r) => r.course === this.course); // Exact match might fail if API returns slightly different. Stick to exact for now or improve.
    }

    return list;
  }

  trackById(_: number, r: StudentRow): string {
    return r.id;
  }

  goBack(): void {
    history.back();
  }
}

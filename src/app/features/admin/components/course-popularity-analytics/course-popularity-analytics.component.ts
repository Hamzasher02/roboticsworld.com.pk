import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoursePopularityComponent } from "../course-popularity/course-popularity.component";
import { Router } from '@angular/router';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';
@Component({
  selector: 'app-course-popularity-analytics',
  imports: [CommonModule, FormsModule, DecimalPipe, CoursePopularityComponent],
  templateUrl: './course-popularity-analytics.component.html',
  styleUrl: './course-popularity-analytics.component.css'
})
export class CoursePopularityAnalyticsComponent {
  @Output() close = new EventEmitter<void>();
  constructor(private router: Router) { }

  goBack() {
    this.router.navigate([`${getAdminBasePath()}/dashboard`]);
  }
  pageTitle = 'Course Popularity Analytics';
  subtitle = 'Track enrollment trends and identify high-performing courses';

  filterOptions = ['Last 30 Days', 'Last 7 Days', 'Last 90 Days'];
  selectedDateFilter = this.filterOptions[0];

  categories = ['All Categories', 'Technology', 'Marketing', 'Design'];
  selectedCategory = this.categories[0];

  courses = ['All Courses', 'Advanced JavaScript', 'UI/UX Design Principles'];
  selectedCourse = this.courses[0];

  totalEnrollments = 1201;
  enrollmentChange = 12.5;

  activeCourses = 24;
  newCourses = 3;

  avgEnrollment = 54;
  avgEnrollmentChange = -2.3;

  growthRate = 18.3;
  growthRateImprovement = 5.2;

  mostPopularCourses = [
    { title: 'Advanced JavaScript', category: 'Programming', students: 145, percentage: 13.3 },
    { title: 'UI/UX Designing', category: 'Programming', students: 145, percentage: 13.3 },
    { title: 'React Development', category: 'Programming', students: 145, percentage: 13.2 },
  ];

  needsAttentionCourses = [
    { title: 'Machine Learning Basics', category: 'Programming', students: 145, percentage: 13.2 },
    { title: 'Data Science', category: 'Programming', students: 145, percentage: 13.2 },
  ];

  handleFilterChange(filterType: string, value: string) {
    console.log(`${filterType} changed to: ${value}`);
  }

  resetFilters() {
    this.selectedDateFilter = this.filterOptions[0];
    this.selectedCategory = this.categories[0];
    this.selectedCourse = this.courses[0];
    console.log('Filters reset');
  }


}
import { Component, Input } from '@angular/core';
import { CoursePopularityComponent } from '../course-popularity/course-popularity.component';
import { CommonModule } from '@angular/common';
import { InstructorPerformanceComponent } from '../instructor-performance/instructor-performance.component';
import { StudentEngagementComponent } from '../student-engagement/student-engagement.component';

@Component({
  selector: 'app-ai-powered-analytics',
  imports: [
    CommonModule,
    CoursePopularityComponent,
    InstructorPerformanceComponent,
    StudentEngagementComponent,
    
  ],
  templateUrl: './ai-powered-analytics.component.html',
  styleUrl: './ai-powered-analytics.component.css',
})
export class AIPoweredAnalyticsComponent {
  // Input properties to make the component reusable
  @Input() performanceData: { label: string; score: number; color: string }[] =
    [];
  @Input() footerLabel: string = '';
  @Input() footerValue: string = '';

  // Default color palette for consistency (from screenshot)
  // These colors can be mapped to the scores dynamically
  colorPalette = [
    '#66BB6A', // Green
    '#4FC3F7', // Cyan/Light Blue
    '#FFCA28', // Yellow/Orange
    '#FFA726', // Orange
    '#EF5350', // Red/Dark Orange
  ];
}

import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';
import {
  ChartComponent,
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  grid: ApexGrid;
  colors: string[];
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
};

interface Instructor {
  name: string;
  rating: number;
  students: number;
  sessions: number;
  satisfaction: number;
  avatar?: string; // <-- Added avatar field
}


@Component({
  selector: 'app-instructor-performance-analytics',
  standalone: true, // Assuming this is needed for modern Angular setup since imports are defined
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './instructor-performance-analytics.component.html',
  styleUrl: './instructor-performance-analytics.component.css'
})
export class InstructorPerformanceAnalyticsComponent {
  @Output() close = new EventEmitter<void>();
  public instructorPerformanceChartOptions: any;
  ngOnInit() {
    this.initializeChartOptions();
  }
  constructor(private router: Router) { }

  // Function to navigate back (Keep for functionality)
  goBack() {
    this.router.navigate([`${getAdminBasePath()}/dashboard`]);
  }

  // Text Data from Image
  pageTitle = 'Instructor Performance Analytics';
  subtitle = 'Compare instructor effectiveness and identify improvement opportunities';

  // Filter Data (Keep as is since they are placeholders)
  filterOptions = ['Last 30 Days', 'Last 7 Days', 'Last 90 Days'];
  selectedDateFilter = this.filterOptions[0]; // 'Last 30 Days'
  categories = ['All Categories', 'Technology', 'Marketing', 'Design'];
  selectedCategory = this.categories[0]; // 'All Categories'
  courses = ['All Courses', 'Advanced JavaScript', 'UI/UX Design Principles'];
  selectedCourse = this.courses[0]; // 'All Courses'

  // Top Dashboard Stats (Matching Image)
  totalStudents = 120;
  totalStudentsGrowth = 15; // +15% growth

  avgRating = 4.6;
  avgRatingChange = 0.2; // +0.2 vs last month

  avgSatisfaction = 88; // %
  avgSatisfactionImprovement = 3; // +3% improvement

  totalSessions = 156;
  totalSessionsChange = 12; // +12 this month

  topInstructors: Instructor[] = [
    { name: 'Emily Johnson', rating: 4.8, students: 234, sessions: 34, satisfaction: 92, avatar: '/assets/admin/Admin.svg' },
    { name: 'Emily Johnson', rating: 4.8, students: 234, sessions: 34, satisfaction: 92, avatar: '/assets/admin/Admin.svg' },
    { name: 'Emily Johnson', rating: 4.8, students: 234, sessions: 34, satisfaction: 92, avatar: '/assets/admin/Admin.svg' },
  ];

  // Dummy Handler for filter/reset actions
  handleFilterChange(filterType: string, value: string) {
    console.log(`${filterType} changed to: ${value}`);
  }

  resetFilters() {
    this.selectedDateFilter = this.filterOptions[0];
    this.selectedCategory = this.categories[0];
    this.selectedCourse = this.courses[0];
    console.log('Filters reset');
  }
  private initializeChartOptions() {
    this.instructorPerformanceChartOptions = {
      series: [
        { name: "Metric 1", data: [75, 85, 75] },
        { name: "Metric 2", data: [85, 75, 60] },
        { name: "Metric 3", data: [65, 65, 85] },
      ],
      chart: { type: "bar", height: 300, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: '60%', endingShape: 'flat' } },
      dataLabels: { enabled: true, style: { fontSize: '14px', fontFamily: 'Inter, sans-serif', colors: ['#1F2937'] } },
      colors: ['#800080', '#e0e0e0', '#36454F'],
      xaxis: {
        categories: ['Week 2', 'Week 3', 'Week 4'],
        labels: { style: { fontSize: '14px', fontFamily: 'Inter, sans-serif', colors: ['#6B7280'] } }
      },
      yaxis: {
        min: 0, max: 100, tickAmount: 4,
        labels: { style: { fontSize: '14px', fontFamily: 'Inter, sans-serif', colors: ['#6B7280'] } }
      },
      grid: { borderColor: '#E5E7EB', strokeDashArray: 3 },
      tooltip: { enabled: true },
      legend: { show: false }
    };
  }

}
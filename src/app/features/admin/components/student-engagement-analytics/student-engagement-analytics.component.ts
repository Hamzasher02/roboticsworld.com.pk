import {
  Component,
  EventEmitter,
  Output,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexYAxis,
  ApexGrid,
  ApexStroke,
  ApexFill
} from 'ng-apexcharts';

/* =======================
   Chart Options Interface
======================= */
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  fill: ApexFill;
  colors: string[];
};

interface Instructor {
  name: string;
  rating: number;
  students: number;
  sessions: number;
  satisfaction: number;
  avatar?: string;
}

@Component({
  selector: 'app-student-engagement-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './student-engagement-analytics.component.html',
  styleUrl: './student-engagement-analytics.component.css'
})
export class StudentEngagementAnalyticsComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

  public instructorPerformanceChartOptions!: ChartOptions;


  /* =======================
      Page Text
  ======================= */
  pageTitle = 'Student Engagement Analytics';
  subtitle =
    'Analyze activity patterns and identify engagement optimization opportunities';

  /* =======================
      Filters
  ======================= */
  filterOptions = ['Last 30 Days', 'Last 7 Days', 'Last 90 Days'];
  selectedDateFilter = this.filterOptions[0];

  categories = ['All Categories', 'Technology', 'Marketing', 'Design'];
  selectedCategory = this.categories[0];

  courses = ['Courses', 'Advanced JavaScript', 'UI/UX Design Principles'];
  selectedCourse = this.courses[0];

  /* =======================
      Stats
  ======================= */
  activeStudents = 1201;
  activeStudentsChange = 8.3;

  avgSessionTime = 24;
  avgSessionTimeChange = 12;

  completionRate = 82.7;
  completionRateImprovement = 2.1;

  dropOffRate = 18.3;
  dropOffRateChange = -1.3;

  topInstructors: Instructor[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.initializeChartOptions();
  }

  /* =======================
      Chart Setup
  ======================= */
  private initializeChartOptions(): void {
    this.instructorPerformanceChartOptions = {
      series: [
        {
          name: 'Engagement Score',
          data: [100, 92, 85, 78, 68]
        }
      ],

      chart: {
        type: 'area',
        height: 260,
        toolbar: { show: false }
      },

      stroke: {
        curve: 'smooth',
        width: 2
      },

      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },

      colors: ['#C084FC'], // Purple gradient

      xaxis: {
        categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px'
          }
        }
      },

      yaxis: {
        min: 0,
        max: 100,
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px'
          }
        }
      },

      dataLabels: {
        enabled: false
      },

      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 4
      }
    };
  }

  /* =======================
      Actions
  ======================= */
  handleFilterChange(type: string, value: string) {
    console.log(`${type} changed to`, value);
  }

  resetFilters() {
    this.selectedDateFilter = this.filterOptions[0];
    this.selectedCategory = this.categories[0];
    this.selectedCourse = this.courses[0];
  }

  goBack() {
    this.router.navigate([`${getAdminBasePath()}/dashboard`]);
  }
}

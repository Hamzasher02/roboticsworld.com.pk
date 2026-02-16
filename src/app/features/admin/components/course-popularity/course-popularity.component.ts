import { Component, ViewChild } from '@angular/core';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexXAxis,
  ApexGrid,
  ApexLegend
} from 'ng-apexcharts';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
};

@Component({
  selector: 'app-course-popularity',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './course-popularity.component.html',
  styleUrls: ['./course-popularity.component.css'],
})
export class CoursePopularityComponent {
  @ViewChild('chart') chart!: ChartComponent;

  courseData = [
    { label: 'Web Dev', height: 60 },
    { label: 'UI/UX', height: 85 },
    { label: 'Mkt/Sales', height: 70 },
    { label: 'AI/ML', height: 45 },
    { label: 'Data Sci', height: 95 },
  ];

  public chartOptions: ChartOptions;


  constructor(private router: Router) {
    this.chartOptions = {
      series: [
        {
          name: 'Popularity',
          data: this.courseData.map((item) => item.height),
        },
      ],
      chart: {
        type: 'bar',
        height: 260,
        toolbar: { show: false },
      },
      colors: this.courseData.map(() => '#90CAF9'),
      plotOptions: {
        bar: {
          distributed: false,
          columnWidth: '45%',
          borderRadius: 4,
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: { show: false },
      xaxis: {
        categories: this.courseData.map((item) => item.label),
        labels: {
          rotate: 0,
          style: { fontSize: '12px', colors: this.courseData.map(() => '#90CAF9') },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { show: false },
    };
  }

  mostPopular = 'Web Development';
  trending = 'AI & Machine Learning';


  goToAnalytics() {
    this.router.navigate([`${getAdminBasePath()}/course-popularity-analytics`]);
  }

}

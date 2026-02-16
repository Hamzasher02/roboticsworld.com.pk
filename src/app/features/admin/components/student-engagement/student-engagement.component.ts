import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexYAxis,
  ApexMarkers,
  ApexFill,
  ApexDataLabels,
  ApexGrid
} from "ng-apexcharts";
import { Router } from '@angular/router';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  markers: ApexMarkers;
  fill: ApexFill;
  grid: ApexGrid;
};

@Component({
  selector: 'app-student-engagement',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './student-engagement.component.html',
  styleUrls: ['./student-engagement.component.css']
})
export class StudentEngagementComponent {

  public chartOptions: ChartOptions;

  mostEngaged = 'Data Science (92%)';
  leastEngaged = 'Marketing (67%)';

  constructor(private router: Router) {
    const engagementData = [75, 88, 70, 78, 92, 85];
    const chartLabels = ['Web Dev', '', 'UI/UX', '', 'AI/ML', ''];

    this.chartOptions = {
      series: [
        {
          name: "Engagement Score",
          data: engagementData
        }
      ],
      chart: {
        height: 210,
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 3,
        colors: ["#F59E0B"]
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 100],
          gradientToColors: ["#FFFBEB"]
        }
      },
      markers: { size: 0, hover: { size: 6 } },
      xaxis: {
        categories: chartLabels,
        labels: {
          show: true,
          style: { colors: '#9CA3AF', fontSize: '10px' }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { show: false },
      grid: { show: false }
    };
  }
  goToAnalytics() {
    this.router.navigate([`${getAdminBasePath()}/student-engagement-analytics`]);
  }
}

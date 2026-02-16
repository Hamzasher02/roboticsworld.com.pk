import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexGrid,
  ApexXAxis
} from 'ng-apexcharts';

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
  selector: 'app-instructor-performance',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './instructor-performance.component.html',
  styleUrls: ['./instructor-performance.component.css']
})
export class InstructorPerformanceComponent {

  @ViewChild("chart") chart!: ChartComponent;

  public chartOptions: ChartOptions;

  constructor(private router: Router) {
    this.chartOptions = {
      series: [
        {
          name: "Performance",
          data: [130, 125, 120, 95, 110] // added 5th bar
        }
      ],

      chart: {
        type: 'bar',
        height: 260,
        toolbar: { show: false }
      },

      colors: ["#8DD3C7", "#0FE4C0", "#FBBF72", "#42D87B", "#FC8D62"],

      plotOptions: {
        bar: {
          distributed: true,
          columnWidth: "45%",
          borderRadius: 0 // removed radius for simple bars
        }
      },

      dataLabels: { enabled: false },
      legend: { show: false },
      grid: { show: false },

      xaxis: {
        categories: ["Emily J", "John D", "Alice K", "David M", "Sarah L"], // 5 categories
        labels: {
          rotate: -45,
          style: {
            colors: ["#8DD3C7", "#0FE4C0", "#FBBF72", "#42D87B", "#FFC107"],
            fontSize: "12px"
          }
        }
      },

      yaxis: { show: false }
    };
  }

  topRated = { name: "Emily Johnson", rating: 4.9 };
  needsImprovement = { name: "David Miller", rating: 3.2 };
  goToAnalytics() {
    this.router.navigate([`${getAdminBasePath()}/instructor-performance-analytics`]);
  }
}
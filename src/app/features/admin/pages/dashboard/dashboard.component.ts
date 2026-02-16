import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodaySessionComponent } from '../../components/today-session/today-session.component';
import { AIPoweredAnalyticsComponent } from '../../components/ai-powered-analytics/ai-powered-analytics.component';
import { RouterOutlet, Router } from "@angular/router";
import { PaymentOverviewComponent } from "../../components/payment-overview/payment-overview.component";
import { AllInstructorService } from '../../../../core/services/admin/all-instructor/all-instructor.service';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TodaySessionComponent, AIPoweredAnalyticsComponent, PaymentOverviewComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private instructorService: AllInstructorService
  ) { }

  ngOnInit(): void {
    this.fetchInstructorStats();
  }
  Math = Math;
  currentDate = new Date();

  // Revenue
  totalRevenue = 128540;
  revenueChange = 12.5;
  last30Days = ['Last 30 days', 'Last 7 days', 'Last 90 days'];
  selectedPeriod = this.last30Days[0];
  // Verified
  verifiedPercentage = 0;
  totalVerified = 0;

  // Pending
  pendingPercentage = 0;
  totalPending = 0;

  // Student Metrics
  activeStudents = 3842;
  newRegistrations = 127;
  registrationChange = 8.2;
  engagementRate = 78;

  getBarChartData() {
    return [30, 45, 60, 50, 75, 90, 85, 95];
  }

  onVerifyInstructors() {
    this.router.navigate([`${getAdminBasePath()}/manage-user`]);
  }

  private fetchInstructorStats(): void {
    this.instructorService.getInstructorVerificationStats().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const verified = res.data.verifiedInstructors || 0;
          const unverified = res.data.unverifiedInstructors || 0;
          const total = verified + unverified;

          this.totalVerified = verified;
          this.totalPending = unverified;

          if (total > 0) {
            this.verifiedPercentage = Math.round((verified / total) * 100);
            this.pendingPercentage = Math.round((unverified / total) * 100);
          } else {
            this.verifiedPercentage = 0;
            this.pendingPercentage = 0;
          }
        }
      },
      error: (err: any) => {
        console.error('Error fetching instructor stats:', err);
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OverviewComponent } from "../../components/quiz/overview/overview.component";
import { AllQuizComponent } from "../../components/quiz/all-quiz/all-quiz.component";
import { AnalyticsComponent } from "../../components/quiz/analytics/analytics.component";

type QuizTab = 'overview' | 'all' | 'analytics';

@Component({
  selector: 'app-quiz-management',
  standalone: true,
  imports: [CommonModule, OverviewComponent, AllQuizComponent, AnalyticsComponent],
  templateUrl: './quiz-management.component.html',
  styleUrl: './quiz-management.component.css'
})
export class QuizManagementComponent {
  activeTab: QuizTab = 'overview';

  setTab(tab: QuizTab) {
    this.activeTab = tab;
  }

  isTab(tab: QuizTab) {
    return this.activeTab === tab;
  }
}

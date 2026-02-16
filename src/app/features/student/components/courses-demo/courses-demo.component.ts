import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DemoSessionService } from '../../../../core/services/student/demo-session/demo-session.service';
import { DemoSession } from '../../../../core/interfaces/student/demo-session/demo-session.interface';

@Component({
  selector: 'app-courses-demo',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './courses-demo.component.html',
  styleUrl: './courses-demo.component.css'
})
export class CoursesDemoComponent implements OnInit {
  sessions: DemoSession[] = [];
  upcomingSessions: DemoSession[] = [];
  previousSessions: DemoSession[] = [];
  nextLiveSession: DemoSession | null = null;
  loading = true;
  error = '';
  activeTab: 'upcoming' | 'previous' = 'upcoming';

  constructor(private demoSessionService: DemoSessionService) { }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.demoSessionService.getMyDemoRequests().subscribe({
      next: (data) => {
        // API returns data directly as mapped in service
        this.sessions = data;
        const now = new Date();

        this.upcomingSessions = this.sessions
          .filter(s => {
            // Logic for upcoming: 'pending' or 'approved' with future date
            const d = new Date(s.preferredDate);
            return (s.status === 'pending' || s.status === 'approved') && d >= now;
          })
          .sort((a, b) => new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime());

        this.previousSessions = this.sessions
          .filter(s => {
            // Logic for previous: 'completed', 'cancelled', 'rejected' or past date
            const d = new Date(s.preferredDate);
            return s.status === 'completed' || s.status === 'cancelled' || s.status === 'rejected' || d < now;
          })
          .sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime());

        // Next live session logic - find first approved upcoming/pending (if treating pending as upcoming interest)
        // Usually Live session widget is for APPROVED ones.
        this.nextLiveSession = this.upcomingSessions.find(s => s.status === 'approved') || this.upcomingSessions[0] || null;

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load demo sessions:', err);
        this.error = 'Failed to load demo sessions';
        this.loading = false;
      }
    });
  }

  setTab(tab: 'upcoming' | 'previous'): void {
    this.activeTab = tab;
  }

  get displayedSessions(): DemoSession[] {
    return this.activeTab === 'upcoming' ? this.upcomingSessions : this.previousSessions;
  }

  isUpcoming(session: DemoSession): boolean {
    const d = new Date(session.preferredDate);
    return d > new Date() && session.status !== 'completed' && session.status !== 'cancelled' && session.status !== 'rejected';
  }
}


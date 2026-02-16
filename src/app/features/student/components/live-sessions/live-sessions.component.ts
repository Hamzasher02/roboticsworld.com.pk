import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionsService } from '../../../../core/services/student/sessions/sessions.service';
import { CourseSession } from '../../../../core/interfaces/student/sessions/sessions.interface';

@Component({
  selector: 'app-live-sessions',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './live-sessions.component.html',
  styleUrl: './live-sessions.component.css'
})
export class LiveSessionsComponent implements OnInit {
  sessions: CourseSession[] = [];
  loading = true;
  error = '';

  constructor(private sessionsService: SessionsService) { }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.sessionsService.getMySessions().subscribe({
      next: (response) => {
        this.sessions = response.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load sessions:', err);
        this.error = 'Failed to load sessions';
        this.loading = false;
      }
    });
  }

  isLive(session: CourseSession): boolean {
    return session.sessionStatus === 'ongoing';
  }
}


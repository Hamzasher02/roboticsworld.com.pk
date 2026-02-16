import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common'; // Import CommonModule
import { DemoSessionService } from '../../../../core/services/student/demo-session/demo-session.service';
import { DemoSession } from '../../../../core/interfaces/student/demo-session/demo-session.interface';

@Component({
  selector: 'app-session-detail-demo',
  standalone: true, // Ensure standalone is true
  imports: [RouterLink, CommonModule], // Add CommonModule here
  templateUrl: './session-detail-demo.component.html',
  styleUrl: './session-detail-demo.component.css'
})
export class SessionDetailDemoComponent implements OnInit {
  session: DemoSession | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private demoSessionService: DemoSessionService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadSession(id);
      } else {
        this.error = 'No session ID provided';
        this.loading = false;
      }
    });
  }

  loadSession(id: string): void {
    this.loading = true;
    this.demoSessionService.getDemoRequestById(id).subscribe({
      next: (session) => {
        if (session) {
          this.session = session;
        } else {
          this.error = 'Session not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load session details:', err);
        this.error = 'Failed to load session details';
        this.loading = false;
      }
    });
  }
}


import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-generate-certificate',
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './generate-certificate.component.html',
  styleUrl: './generate-certificate.component.css'
})
export class GenerateCertificateComponent implements OnInit {
  showDownloadSuccess = false;
  courseId: string | null = null;
  parentPath: string = 'live-sessions';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const parentSnapshot = this.route.parent?.snapshot;
    this.courseId = parentSnapshot?.paramMap.get('id') || null;

    // Detect if parent is live-sessions or recorded-sessions
    const path = parentSnapshot?.url[0]?.path;
    if (path) {
      this.parentPath = path;
    }
  }

  onDownloadCertificate(): void {
    this.showDownloadSuccess = true;

    setTimeout(() => {
      this.showDownloadSuccess = false;
    }, 2000);
  }

}

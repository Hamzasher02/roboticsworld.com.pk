import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-course-detail-page',
  imports: [RouterLink,CommonModule],
  templateUrl: './course-detail-page.component.html',
  styleUrl: './course-detail-page.component.css'
})
export class CourseDetailPageComponent {
  email = "dmiller22@gmail.com";

  openCurriculumModule: number | null = 0; 

  toggleCurriculumModule(moduleNo: number): void {
    this.openCurriculumModule = this.openCurriculumModule === moduleNo ? null : moduleNo;
  }

  openIndex: number | null = null;
}

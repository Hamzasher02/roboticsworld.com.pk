import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiAssistantComponent } from '../ai-assistant/ai-assistant.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courses',
  imports: [RouterLink, AiAssistantComponent, CommonModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent {
  isAiOpen = false;
  // activeTab: string = 'Science';
  activeCategory: string = 'Science';


  openAi() {
    this.isAiOpen = true;
  }

  closeAi() {
    this.isAiOpen = false;
  }

   setCategory(category: string): void {
    this.activeCategory = category;
  }
  categories: string[] = [
    'Science',
    'Technology',
    'Engineering',
    'Arts',
    'Mathematics',
  ];

  @ViewChild('coursesSection') coursesSection!: ElementRef<HTMLElement>;

scrollToCourses() {
  this.coursesSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
}

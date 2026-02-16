import { Component } from '@angular/core';
import { InstructorHeaderComponent } from '../../components/instructor-header/instructor-header.component';
import { InstructorSidebarComponent } from '../../components/instructor-sidebar/instructor-sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-instructor-home',
  imports: [  RouterOutlet ,InstructorHeaderComponent, InstructorSidebarComponent],
  templateUrl: './instructor-home.component.html',
  styleUrl: './instructor-home.component.css'
})
export class InstructorHomeComponent {

}


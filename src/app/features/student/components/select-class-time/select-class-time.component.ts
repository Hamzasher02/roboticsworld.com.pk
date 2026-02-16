import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { StudentEnrollmentStateService } from '../../../../core/services/student/enrollment/student-enrollment-state.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-select-class-time',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './select-class-time.component.html',
  styleUrl: './select-class-time.component.css'
})
export class SelectClassTimeComponent {
  selectedTime = '';


  constructor(
    private enrollmentState: StudentEnrollmentStateService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    const state = this.enrollmentState.getState();
    // Validate we should be here
    if (!state.courseData || state.enrollmentType !== 'Live Classes') {
      console.warn('SelectClassTime: Invalid state, redirecting to courses');
      this.router.navigate(['/student/courses']);
    }
  }

  onCancel() {
    this.enrollmentState.setEnrollmentType('Live Classes');
    this.router.navigate(['/student/buy-course']);
  }

  onConfirm() {
    if (!this.selectedTime) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a time slot.' });
      return;
    }
    this.enrollmentState.setTimeSlot(this.selectedTime);
    console.log('SelectClassTime: Time selected:', this.selectedTime);
    this.router.navigate(['/student/checkout']);
  }
}

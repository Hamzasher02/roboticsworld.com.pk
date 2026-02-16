import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';

type CompetitionInfo = {
  logoSrc: string;
  title: string;
  subtitle: string;
  hostedByLabel: string;
  hostedBy: string;
  startsAtLabel: string;
  startsAt: string;
  endsAtLabel: string;
  endsAt: string;
  teamSizeLabel: string;
  teamSize: string;
};

// ✅ Typed controls
type CompetitionFormGroup = FormGroup<{
  studentName: FormControl<string>;
  grade: FormControl<string>;
  schoolName: FormControl<string>;
  email: FormControl<string>;
  consent: FormControl<boolean>;
}>;

@Component({
  selector: 'app-competition-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './competition-form.component.html',
  styleUrl: './competition-form.component.css',
})
export class CompetitionFormComponent {
  info: CompetitionInfo = {
    logoSrc: 'assets/steam-mind/competition/steamlogo.svg',
    title: 'IQL Algorithms',
    subtitle: 'Preparation Guide',
    hostedByLabel: 'Hosted By',
    hostedBy: 'STEAM Minds',
    startsAtLabel: 'Starts At',
    startsAt: 'May 8, 2021 04:30 PM',
    endsAtLabel: 'Ends At',
    endsAt: 'May 8, 2021 04:30 PM',
    teamSizeLabel: 'Team Size',
    teamSize: '1 Member',
  };

  grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
  ];

  submitting = false;

  // ✅ typed form
  form: CompetitionFormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      studentName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
      grade: this.fb.nonNullable.control('', [Validators.required]),
      schoolName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      consent: this.fb.nonNullable.control(false, [Validators.requiredTrue]),
    });
  }

  // ✅ now template can safely do: f.consent, f.studentName, etc.
  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields correctly.' });
      return;
    }
    if (this.submitting) return;

    this.submitting = true;

    const payload = this.form.getRawValue(); // ✅ typed payload
    console.log('COMPETITION REGISTRATION PAYLOAD:', payload);

    setTimeout(() => {
      this.submitting = false;
    }, 600);
  }
}

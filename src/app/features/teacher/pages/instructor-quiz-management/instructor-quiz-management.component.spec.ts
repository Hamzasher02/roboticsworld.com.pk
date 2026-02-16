import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorQuizManagementComponent } from './instructor-quiz-management.component';

describe('InstructorQuizManagementComponent', () => {
  let component: InstructorQuizManagementComponent;
  let fixture: ComponentFixture<InstructorQuizManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorQuizManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorQuizManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


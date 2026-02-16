import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentQuizViewComponent } from './student-quiz-view.component';

describe('StudentQuizViewComponent', () => {
  let component: StudentQuizViewComponent;
  let fixture: ComponentFixture<StudentQuizViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentQuizViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentQuizViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


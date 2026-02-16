import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizAttemptDetailComponent } from './quiz-attempt-detail.component';

describe('QuizAttemptDetailComponent', () => {
  let component: QuizAttemptDetailComponent;
  let fixture: ComponentFixture<QuizAttemptDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizAttemptDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizAttemptDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


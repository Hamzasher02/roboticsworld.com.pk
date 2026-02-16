import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizReveiwComponent } from './quiz-reveiw.component';

describe('QuizReveiwComponent', () => {
  let component: QuizReveiwComponent;
  let fixture: ComponentFixture<QuizReveiwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizReveiwComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizReveiwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

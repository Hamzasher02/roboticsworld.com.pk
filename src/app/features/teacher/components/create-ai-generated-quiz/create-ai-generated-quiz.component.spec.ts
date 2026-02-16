import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAiGeneratedQuizComponent } from './create-ai-generated-quiz.component';

describe('CreateAiGeneratedQuizComponent', () => {
  let component: CreateAiGeneratedQuizComponent;
  let fixture: ComponentFixture<CreateAiGeneratedQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAiGeneratedQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAiGeneratedQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


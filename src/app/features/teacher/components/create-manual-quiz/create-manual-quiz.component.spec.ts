import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateManualQuizComponent } from './create-manual-quiz.component';

describe('CreateManualQuizComponent', () => {
  let component: CreateManualQuizComponent;
  let fixture: ComponentFixture<CreateManualQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateManualQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateManualQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualAddQuestionComponent } from './manual-add-question.component';

describe('ManualAddQuestionComponent', () => {
  let component: ManualAddQuestionComponent;
  let fixture: ComponentFixture<ManualAddQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualAddQuestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualAddQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


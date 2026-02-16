import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesFeedbackComponent } from './courses-feedback.component';

describe('CoursesFeedbackComponent', () => {
  let component: CoursesFeedbackComponent;
  let fixture: ComponentFixture<CoursesFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursesFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

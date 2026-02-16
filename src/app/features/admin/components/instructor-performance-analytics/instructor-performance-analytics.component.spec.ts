import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorPerformanceAnalyticsComponent } from './instructor-performance-analytics.component';

describe('InstructorPerformanceAnalyticsComponent', () => {
  let component: InstructorPerformanceAnalyticsComponent;
  let fixture: ComponentFixture<InstructorPerformanceAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorPerformanceAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorPerformanceAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

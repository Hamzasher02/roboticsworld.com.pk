import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursePopularityAnalyticsComponent } from './course-popularity-analytics.component';

describe('CoursePopularityAnalyticsComponent', () => {
  let component: CoursePopularityAnalyticsComponent;
  let fixture: ComponentFixture<CoursePopularityAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursePopularityAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursePopularityAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

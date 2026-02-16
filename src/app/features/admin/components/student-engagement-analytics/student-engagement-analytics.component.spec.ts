import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEngagementAnalyticsComponent } from './student-engagement-analytics.component';

describe('StudentEngagementAnalyticsComponent', () => {
  let component: StudentEngagementAnalyticsComponent;
  let fixture: ComponentFixture<StudentEngagementAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentEngagementAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentEngagementAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

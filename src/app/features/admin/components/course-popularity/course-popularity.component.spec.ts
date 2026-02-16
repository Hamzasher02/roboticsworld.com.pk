import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursePopularityComponent } from './course-popularity.component';

describe('CoursePopularityComponent', () => {
  let component: CoursePopularityComponent;
  let fixture: ComponentFixture<CoursePopularityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursePopularityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursePopularityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

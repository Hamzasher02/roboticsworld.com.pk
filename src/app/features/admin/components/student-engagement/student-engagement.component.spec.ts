import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEngagementComponent } from './student-engagement.component';

describe('StudentEngagementComponent', () => {
  let component: StudentEngagementComponent;
  let fixture: ComponentFixture<StudentEngagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentEngagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentEngagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

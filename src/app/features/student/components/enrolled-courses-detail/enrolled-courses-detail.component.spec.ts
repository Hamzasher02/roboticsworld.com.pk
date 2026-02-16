import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrolledCoursesDetailComponent } from './enrolled-courses-detail.component';

describe('EnrolledCoursesDetailComponent', () => {
  let component: EnrolledCoursesDetailComponent;
  let fixture: ComponentFixture<EnrolledCoursesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrolledCoursesDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrolledCoursesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

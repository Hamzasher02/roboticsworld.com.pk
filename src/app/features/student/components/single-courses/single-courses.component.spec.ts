import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleCoursesComponent } from './single-courses.component';

describe('SingleCoursesComponent', () => {
  let component: SingleCoursesComponent;
  let fixture: ComponentFixture<SingleCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleCoursesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

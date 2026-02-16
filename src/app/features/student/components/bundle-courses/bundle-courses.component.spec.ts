import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleCoursesComponent } from './bundle-courses.component';

describe('BundleCoursesComponent', () => {
  let component: BundleCoursesComponent;
  let fixture: ComponentFixture<BundleCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BundleCoursesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BundleCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorPerformanceComponent } from './instructor-performance.component';

describe('InstructorPerformanceComponent', () => {
  let component: InstructorPerformanceComponent;
  let fixture: ComponentFixture<InstructorPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorPerformanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

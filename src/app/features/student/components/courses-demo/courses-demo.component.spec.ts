import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesDemoComponent } from './courses-demo.component';

describe('CoursesDemoComponent', () => {
  let component: CoursesDemoComponent;
  let fixture: ComponentFixture<CoursesDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursesDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

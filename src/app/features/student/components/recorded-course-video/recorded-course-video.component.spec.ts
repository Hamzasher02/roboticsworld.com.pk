import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordedCourseVideoComponent } from './recorded-course-video.component';

describe('RecordedCourseVideoComponent', () => {
  let component: RecordedCourseVideoComponent;
  let fixture: ComponentFixture<RecordedCourseVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordedCourseVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordedCourseVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

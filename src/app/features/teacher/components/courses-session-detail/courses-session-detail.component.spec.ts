import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesSessionDetailComponent } from './courses-session-detail.component';

describe('CoursesSessionDetailComponent', () => {
  let component: CoursesSessionDetailComponent;
  let fixture: ComponentFixture<CoursesSessionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesSessionDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursesSessionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


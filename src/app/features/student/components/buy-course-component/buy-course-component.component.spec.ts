import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyCourseComponentComponent } from './buy-course-component.component';

describe('BuyCourseComponentComponent', () => {
  let component: BuyCourseComponentComponent;
  let fixture: ComponentFixture<BuyCourseComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyCourseComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyCourseComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaySessionComponent } from './today-session.component';

describe('TodaySessionComponent', () => {
  let component: TodaySessionComponent;
  let fixture: ComponentFixture<TodaySessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodaySessionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodaySessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

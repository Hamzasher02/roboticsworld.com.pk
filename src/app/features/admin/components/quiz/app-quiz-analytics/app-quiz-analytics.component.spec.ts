import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppQuizAnalyticsComponent } from './app-quiz-analytics.component';

describe('AppQuizAnalyticsComponent', () => {
  let component: AppQuizAnalyticsComponent;
  let fixture: ComponentFixture<AppQuizAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppQuizAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppQuizAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

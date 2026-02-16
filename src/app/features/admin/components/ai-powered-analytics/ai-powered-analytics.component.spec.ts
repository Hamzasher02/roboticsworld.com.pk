import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AIPoweredAnalyticsComponent } from './ai-powered-analytics.component';

describe('AIPoweredAnalyticsComponent', () => {
  let component: AIPoweredAnalyticsComponent;
  let fixture: ComponentFixture<AIPoweredAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIPoweredAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AIPoweredAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

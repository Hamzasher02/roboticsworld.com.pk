import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionDetailDemoComponent } from './session-detail-demo.component';

describe('SessionDetailDemoComponent', () => {
  let component: SessionDetailDemoComponent;
  let fixture: ComponentFixture<SessionDetailDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionDetailDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionDetailDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

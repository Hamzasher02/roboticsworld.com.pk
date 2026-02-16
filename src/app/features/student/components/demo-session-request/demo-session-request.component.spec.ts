import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoSessionRequestComponent } from './demo-session-request.component';

describe('DemoSessionRequestComponent', () => {
  let component: DemoSessionRequestComponent;
  let fixture: ComponentFixture<DemoSessionRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoSessionRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoSessionRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

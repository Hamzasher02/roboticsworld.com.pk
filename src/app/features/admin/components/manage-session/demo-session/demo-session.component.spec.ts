import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoSessionComponent } from './demo-session.component';

describe('DemoSessionComponent', () => {
  let component: DemoSessionComponent;
  let fixture: ComponentFixture<DemoSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoSessionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

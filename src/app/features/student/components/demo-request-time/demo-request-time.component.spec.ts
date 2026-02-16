import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoRequestTimeComponent } from './demo-request-time.component';

describe('DemoRequestTimeComponent', () => {
  let component: DemoRequestTimeComponent;
  let fixture: ComponentFixture<DemoRequestTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoRequestTimeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoRequestTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

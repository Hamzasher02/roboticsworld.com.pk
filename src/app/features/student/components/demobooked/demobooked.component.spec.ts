import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemobookedComponent } from './demobooked.component';

describe('DemobookedComponent', () => {
  let component: DemobookedComponent;
  let fixture: ComponentFixture<DemobookedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemobookedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemobookedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

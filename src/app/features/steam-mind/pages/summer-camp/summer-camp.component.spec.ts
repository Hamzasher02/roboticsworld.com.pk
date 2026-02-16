import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummerCampComponent } from './summer-camp.component';

describe('SummerCampComponent', () => {
  let component: SummerCampComponent;
  let fixture: ComponentFixture<SummerCampComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummerCampComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummerCampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

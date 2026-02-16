import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CirtificateComponent } from './cirtificate.component';

describe('CirtificateComponent', () => {
  let component: CirtificateComponent;
  let fixture: ComponentFixture<CirtificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CirtificateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CirtificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampsFormComponent } from './camps-form.component';

describe('CampsFormComponent', () => {
  let component: CampsFormComponent;
  let fixture: ComponentFixture<CampsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

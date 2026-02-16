import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectClassTimeComponent } from './select-class-time.component';

describe('SelectClassTimeComponent', () => {
  let component: SelectClassTimeComponent;
  let fixture: ComponentFixture<SelectClassTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectClassTimeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectClassTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

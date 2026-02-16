import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSessionDetailComponent } from './new-session-detail.component';

describe('NewSessionDetailComponent', () => {
  let component: NewSessionDetailComponent;
  let fixture: ComponentFixture<NewSessionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSessionDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewSessionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


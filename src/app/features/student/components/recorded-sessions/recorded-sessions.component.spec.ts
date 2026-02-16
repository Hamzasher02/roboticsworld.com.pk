import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordedSessionsComponent } from './recorded-sessions.component';

describe('RecordedSessionsComponent', () => {
  let component: RecordedSessionsComponent;
  let fixture: ComponentFixture<RecordedSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordedSessionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordedSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

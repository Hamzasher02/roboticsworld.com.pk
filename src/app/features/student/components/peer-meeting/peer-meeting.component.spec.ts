import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerMeetingComponent } from './peer-meeting.component';

describe('PeerMeetingComponent', () => {
  let component: PeerMeetingComponent;
  let fixture: ComponentFixture<PeerMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeerMeetingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeerMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

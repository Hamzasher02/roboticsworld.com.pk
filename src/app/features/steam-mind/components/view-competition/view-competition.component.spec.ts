import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCompetitionComponent } from './view-competition.component';

describe('ViewCompetitionComponent', () => {
  let component: ViewCompetitionComponent;
  let fixture: ComponentFixture<ViewCompetitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCompetitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCompetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

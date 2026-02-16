import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyHelpComponent } from './study-help.component';

describe('StudyHelpComponent', () => {
  let component: StudyHelpComponent;
  let fixture: ComponentFixture<StudyHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

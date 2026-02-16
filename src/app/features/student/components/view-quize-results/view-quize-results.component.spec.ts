import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuizeResultsComponent } from './view-quize-results.component';

describe('ViewQuizeResultsComponent', () => {
  let component: ViewQuizeResultsComponent;
  let fixture: ComponentFixture<ViewQuizeResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewQuizeResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewQuizeResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteHistoryComponent } from './delete-history.component';

describe('DeleteHistoryComponent', () => {
  let component: DeleteHistoryComponent;
  let fixture: ComponentFixture<DeleteHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

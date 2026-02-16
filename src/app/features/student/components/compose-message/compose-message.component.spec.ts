import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComposeMessageComponent } from './compose-message.component';

describe('ComposeMessageComponent', () => {
  let component: ComposeMessageComponent;
  let fixture: ComponentFixture<ComposeMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComposeMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComposeMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

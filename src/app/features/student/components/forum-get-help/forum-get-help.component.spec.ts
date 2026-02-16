import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumGetHelpComponent } from './forum-get-help.component';

describe('ForumGetHelpComponent', () => {
  let component: ForumGetHelpComponent;
  let fixture: ComponentFixture<ForumGetHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumGetHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumGetHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

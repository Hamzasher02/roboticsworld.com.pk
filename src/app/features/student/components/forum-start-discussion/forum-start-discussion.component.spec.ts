import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumStartDiscussionComponent } from './forum-start-discussion.component';

describe('ForumStartDiscussionComponent', () => {
  let component: ForumStartDiscussionComponent;
  let fixture: ComponentFixture<ForumStartDiscussionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumStartDiscussionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumStartDiscussionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

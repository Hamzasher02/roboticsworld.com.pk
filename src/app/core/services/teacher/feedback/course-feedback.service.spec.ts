import { TestBed } from '@angular/core/testing';

import { CourseFeedbackService } from './course-feedback.service';

describe('CourseFeedbackService', () => {
  let service: CourseFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseFeedbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

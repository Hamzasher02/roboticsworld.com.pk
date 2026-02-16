import { TestBed } from '@angular/core/testing';

import { InstructorQuizService } from './instructor-quiz.service';

describe('InstructorQuizService', () => {
  let service: InstructorQuizService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstructorQuizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { EnrollLiveCourseService } from './enroll-live-course.service';

describe('EnrollLiveCourseService', () => {
  let service: EnrollLiveCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnrollLiveCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

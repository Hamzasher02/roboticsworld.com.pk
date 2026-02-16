import { TestBed } from '@angular/core/testing';

import { AllInstructorService } from './all-instructor.service';

describe('AllInstructorService', () => {
  let service: AllInstructorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllInstructorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

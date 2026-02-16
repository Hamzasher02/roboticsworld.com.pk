import { TestBed } from '@angular/core/testing';

import { InstructorAvailabilityService } from './instructor-availability.service';

describe('InstructorAvailabilityService', () => {
  let service: InstructorAvailabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstructorAvailabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

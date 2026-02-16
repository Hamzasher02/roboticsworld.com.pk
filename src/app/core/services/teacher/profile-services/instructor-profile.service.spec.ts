import { TestBed } from '@angular/core/testing';

import { InstructorProfileService } from './instructor-profile.service';

describe('InstructorProfileService', () => {
  let service: InstructorProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstructorProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

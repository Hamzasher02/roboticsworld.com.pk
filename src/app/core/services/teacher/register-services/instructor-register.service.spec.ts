import { TestBed } from '@angular/core/testing';

import { InstructorRegisterService } from './instructor-register.service';

describe('InstructorRegisterService', () => {
  let service: InstructorRegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstructorRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

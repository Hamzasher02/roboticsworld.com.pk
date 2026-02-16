import { TestBed } from '@angular/core/testing';

import { StudentChangePasswordService } from './student-change-password.service';

describe('StudentChangePasswordService', () => {
  let service: StudentChangePasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentChangePasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

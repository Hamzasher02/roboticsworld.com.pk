import { TestBed } from '@angular/core/testing';

import { SignupDraftService } from './signup-draft.service';

describe('SignupDraftService', () => {
  let service: SignupDraftService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignupDraftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

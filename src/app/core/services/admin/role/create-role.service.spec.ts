import { TestBed } from '@angular/core/testing';

import { CreateRoleService } from './create-role.service';

describe('CreateRoleService', () => {
  let service: CreateRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

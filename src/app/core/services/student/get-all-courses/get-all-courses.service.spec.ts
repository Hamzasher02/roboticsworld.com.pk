import { TestBed } from '@angular/core/testing';

import { GetAllCoursesService } from './get-all-courses.service';

describe('GetAllCoursesService', () => {
  let service: GetAllCoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAllCoursesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

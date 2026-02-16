import { TestBed } from '@angular/core/testing';

import { PublicCoursesService } from './public-courses.service';

describe('PublicCoursesService', () => {
  let service: PublicCoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicCoursesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareResourcesComponent } from './share-resources.component';

describe('ShareResourcesComponent', () => {
  let component: ShareResourcesComponent;
  let fixture: ComponentFixture<ShareResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareResourcesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

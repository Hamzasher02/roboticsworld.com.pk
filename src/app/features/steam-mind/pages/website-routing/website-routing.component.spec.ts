import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteRoutingComponent } from './website-routing.component';

describe('WebsiteRoutingComponent', () => {
  let component: WebsiteRoutingComponent;
  let fixture: ComponentFixture<WebsiteRoutingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteRoutingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebsiteRoutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

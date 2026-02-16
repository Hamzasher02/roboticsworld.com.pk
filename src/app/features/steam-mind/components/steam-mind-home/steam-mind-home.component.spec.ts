import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamMindHomeComponent } from './steam-mind-home.component';

describe('SteamMindHomeComponent', () => {
  let component: SteamMindHomeComponent;
  let fixture: ComponentFixture<SteamMindHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SteamMindHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SteamMindHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

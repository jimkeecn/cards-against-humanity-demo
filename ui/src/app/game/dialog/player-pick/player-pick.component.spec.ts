import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerPickComponent } from './player-pick.component';

describe('PlayerPickComponent', () => {
  let component: PlayerPickComponent;
  let fixture: ComponentFixture<PlayerPickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerPickComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerPickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundsStateComponent } from './rounds-state.component';

describe('RoundsStateComponent', () => {
  let component: RoundsStateComponent;
  let fixture: ComponentFixture<RoundsStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundsStateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundsStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JudgePickComponent } from './judge-pick.component';

describe('JudgePickComponent', () => {
  let component: JudgePickComponent;
  let fixture: ComponentFixture<JudgePickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JudgePickComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JudgePickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

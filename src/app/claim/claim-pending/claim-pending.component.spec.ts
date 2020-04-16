import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ClaimPendingComponent} from './claim-pending.component';

describe('ClaimPendingComponent', () => {
  let component: ClaimPendingComponent;
  let fixture: ComponentFixture<ClaimPendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClaimPendingComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PolicyBatchSummaryComponent} from './policy-batch-summary.component';

describe('PolicyBatchSummaryComponent', () => {
  let component: PolicyBatchSummaryComponent;
  let fixture: ComponentFixture<PolicyBatchSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyBatchSummaryComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyBatchSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

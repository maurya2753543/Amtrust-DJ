import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PolicyBatchExecutionHistoryComponent} from './policy-batch-execution-history.component';

describe('PolicyBatchExecutionHistoryComponent', () => {
  let component: PolicyBatchExecutionHistoryComponent;
  let fixture: ComponentFixture<PolicyBatchExecutionHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyBatchExecutionHistoryComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyBatchExecutionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

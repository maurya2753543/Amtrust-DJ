import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ClaimBatchExecutionHistoryComponent} from './claim-batch-execution-history.component';

describe('ClaimBatchExecutionHistoryComponent', () => {
  let component: ClaimBatchExecutionHistoryComponent;
  let fixture: ComponentFixture<ClaimBatchExecutionHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClaimBatchExecutionHistoryComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimBatchExecutionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

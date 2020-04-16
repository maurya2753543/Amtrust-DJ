import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ClaimBatchSummaryComponent} from './claim-batch-summary.component';

describe('ClaimBatchSummaryComponent', () => {
  let component: ClaimBatchSummaryComponent;
  let fixture: ComponentFixture<ClaimBatchSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClaimBatchSummaryComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimBatchSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

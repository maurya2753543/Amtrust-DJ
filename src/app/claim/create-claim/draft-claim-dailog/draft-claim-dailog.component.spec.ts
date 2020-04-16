import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftClaimDailogComponent } from './draft-claim-dailog.component';

describe('DraftClaimDailogComponent', () => {
  let component: DraftClaimDailogComponent;
  let fixture: ComponentFixture<DraftClaimDailogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraftClaimDailogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraftClaimDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

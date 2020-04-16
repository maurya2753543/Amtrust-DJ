import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PolicyListingComponent} from './policy-listing.component';

describe('PolicyListingComponent', () => {
  let component: PolicyListingComponent;
  let fixture: ComponentFixture<PolicyListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyListingComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

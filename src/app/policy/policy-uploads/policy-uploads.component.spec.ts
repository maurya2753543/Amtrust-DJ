import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PolicyUploadsComponent} from './policy-uploads.component';

describe('PolicyUploadsComponent', () => {
  let component: PolicyUploadsComponent;
  let fixture: ComponentFixture<PolicyUploadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyUploadsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyUploadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

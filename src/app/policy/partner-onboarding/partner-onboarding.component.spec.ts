import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerOnboardingComponent } from './partner-onboarding.component';

describe('PartnerOnboardingComponent', () => {
  let component: PartnerOnboardingComponent;
  let fixture: ComponentFixture<PartnerOnboardingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerOnboardingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

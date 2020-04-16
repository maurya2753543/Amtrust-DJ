import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerLandingComponent } from './partner-landing.component';

describe('PartnerLandingComponent', () => {
  let component: PartnerLandingComponent;
  let fixture: ComponentFixture<PartnerLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerLandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

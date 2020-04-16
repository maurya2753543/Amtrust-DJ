import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ClaimUploadsComponent} from './claim-uploads.component';

describe('ClaimUploadsComponent', () => {
  let component: ClaimUploadsComponent;
  let fixture: ComponentFixture<ClaimUploadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClaimUploadsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimUploadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

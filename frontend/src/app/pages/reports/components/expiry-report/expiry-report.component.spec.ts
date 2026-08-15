import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExpiryReportComponent } from './expiry-report.component';

describe('ExpiryReportComponent', () => {
  let component: ExpiryReportComponent;
  let fixture: ComponentFixture<ExpiryReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExpiryReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

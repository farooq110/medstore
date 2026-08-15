import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DebtReportComponent } from './debt-report.component';

describe('DebtReportComponent', () => {
  let component: DebtReportComponent;
  let fixture: ComponentFixture<DebtReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DebtReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DebtReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

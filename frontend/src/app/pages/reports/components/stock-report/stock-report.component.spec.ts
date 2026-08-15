import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StockReportComponent } from './stock-report.component';

describe('StockReportComponent', () => {
  let component: StockReportComponent;
  let fixture: ComponentFixture<StockReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [StockReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

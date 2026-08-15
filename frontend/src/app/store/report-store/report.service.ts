import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiReportsResponse } from './report.model';
import { ApiResponse } from '../api-response';
import { HttpService } from 'src/app/services/http/http-service';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly httpService = inject(HttpService);

  public getAllReports = (): Observable<ApiResponse<ApiReportsResponse>> => {
    return this.httpService.get<ApiResponse<ApiReportsResponse>>('reports/all', {
      cache: false,
    });
  };

  public getFilteredSalesReport = (year: number, month: number, selectAllMonths: boolean = false): Observable<ApiResponse<any>> => {
    let url = `reports/sales?year=${year}`;
    if (!selectAllMonths && month) {
      url += `&month=${month}`;
    }
    return this.httpService.get<ApiResponse<any>>(url, {
      cache: true,
    });
  };
}

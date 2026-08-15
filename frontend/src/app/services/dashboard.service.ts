import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardSummary } from '../store/dashboard-store/dashboard.model';
import { ApiResponse } from '../store/api-response';
import { HttpService } from './http/http-service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly httpService = inject(HttpService);

  /**
   * Get dashboard summary with all metrics
   */
  public getDashboardSummary = (): Observable<ApiResponse<DashboardSummary>> => {
    return this.httpService.get<ApiResponse<DashboardSummary>>('dashboard/summary', {
      cache: true,
      timeout: 10000, // 5 seconds timeout for dashboard summary
    });
  };
}

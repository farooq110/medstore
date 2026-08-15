import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Alert, AlertDto } from './alert.model';
import { ApiResponse, FilterParams, PaginationParams } from '../api-response';
import { HttpService } from 'src/app/services/http/http-service';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly httpService = inject(HttpService);

  /**
   * Get all alerts with pagination (filtered by multi-tenant: business ID)
   */
  public getAllAlerts = (payload: PaginationParams, filter?: FilterParams): Observable<ApiResponse<Alert[]>> => {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      params.append(key, value.toString());
    });

    if (filter && Object.keys(filter).length > 0) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value) && value.length > 0) {
          if (key === 'sortBy') {
            params.append(key, JSON.stringify(value));
          } else {
            value.forEach((v) => params.append(key, v.toString()));
          }
        } else if (!Array.isArray(value)) {
          params.append(key, value.toString());
        }
      });
    }

    return this.httpService.get<ApiResponse<Alert[]>>(`alerts?${params.toString()}`, {
      cache: true,
    });
  };

  /**
   * Get alert by ID
   */
  public getAlertById = (id: string): Observable<ApiResponse<Alert>> => {
    return this.httpService.get<ApiResponse<Alert>>(`alerts/${id}`, {
      cache: true,
    });
  };

  /**
   * Mark alert as seen by current role
   */
  public markAsSeen = (id: string): Observable<ApiResponse<Alert>> => {
    return this.httpService.put<ApiResponse<Alert>>(
      `alerts/${id}/seen`,
      {},
      {
        revalidatePatterns: ['*/alerts*'],
      }
    );
  };

  /**
   * Mark alert as resolved
   */
  public markAsResolved = (id: string): Observable<ApiResponse<Alert>> => {
    return this.httpService.put<ApiResponse<Alert>>(
      `alerts/${id}/resolve`,
      {},
      {
        revalidatePatterns: ['*/alerts*'],
      }
    );
  };

  /**
   * Create alert (usually called from backend, but included for completeness)
   */
  public createAlert = (dto: AlertDto): Observable<ApiResponse<Alert>> => {
    return this.httpService.post<ApiResponse<Alert>>(
      'alerts',
      dto,
      {
        revalidatePatterns: ['*/alerts*'],
      }
    );
  };

  /**
   * Delete alert
   */
  public deleteAlert = (id: string): Observable<ApiResponse<any>> => {
    return this.httpService.delete<ApiResponse<any>>(
      `alerts/${id}`,
      {
        revalidatePatterns: ['*/alerts*'],
      }
    );
  };
}

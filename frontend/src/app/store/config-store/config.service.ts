/**
 * Config Store Service
 * API service for fetching app configuration
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/services/http/http-service';
import { ApiResponse } from '../api-response';
import { AppConfig } from './config.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigStoreService {
  private readonly httpService = inject(HttpService);

  /**
   * Get latest app version from backend
   * Checks if a new version is available for mobile app
   */
  public getAppVersion = (): Observable<ApiResponse<AppConfig>> => {
    return this.httpService.get<ApiResponse<AppConfig>>(
      'config/app-version',
      { cache: false }
    );
  };
}

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Client, CreateClientDto, UpdateClientDto } from './client.model';
import { ApiResponse, FilterParams, PaginationParams } from '../api-response';
import { HttpService } from 'src/app/services/http/http-service';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly httpService = inject(HttpService);

  /**
   * Get all clients with pagination (filtered by role: sales persons only see assigned clients)
   * Sales persons will NOT see salesPerson populated details in response
   */
  public getAllClients = (payload: PaginationParams, filter?: FilterParams): Observable<ApiResponse<Client[]>> => {
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

    return this.httpService.get<ApiResponse<Client[]>>(`clients?${params.toString()}`, {
      cache: true,
    });
  };

  /**
   * Get client by ID
   */
  public getClientById = (id: string): Observable<ApiResponse<Client>> => {
    return this.httpService.get<ApiResponse<Client>>(`clients/${id}`, {
      cache: true,
    });
  };

  /**
   * Get client dues information
   */
  public getClientDues = (id: string): Observable<ApiResponse<any>> => {
    return this.httpService.get<ApiResponse<any>>(`clients/${id}/dues`, {
      cache: true,
    });
  };

  /**
   * Get client detail with analytics (all calculations done on server)
   */
  public getClientDetail = (id: string): Observable<ApiResponse<any>> => {
    return this.httpService.get<ApiResponse<any>>(`clients/${id}/detail`, {
      cache: true,
    });
  };

  /**
   * Create new client
   */
  public createClient = (dto: CreateClientDto): Observable<ApiResponse<Client>> => {
    return this.httpService.post<ApiResponse<Client>>(
      'clients',
      dto,
      {
        revalidatePatterns: ['*/clients*', '*/users*', '*dashboard/summary*', '*reports*'],
      }
    );
  };

  /**
   * Update client
   */
  public updateClient = (id: string, dto: UpdateClientDto): Observable<ApiResponse<Client>> => {
    return this.httpService.put<ApiResponse<Client>>(
      `clients/${id}`,
      dto,
      {
        revalidatePatterns: ['*/clients*', '*/users*', '*dashboard/summary*', '*reports*'],
      }
    );
  };

  /**
   * Delete/Deactivate client
   */
  public deleteClient = (id: string): Observable<ApiResponse<any>> => {
    return this.httpService.put<ApiResponse<any>>(
      `clients/${id}`,
      { isActive: false },
      {
        revalidatePatterns: ['*/clients*', '*/users*', '*dashboard/summary*', '*reports*'],
      }
    );
  };
}

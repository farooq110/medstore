import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from './user.model';
import { ApiResponse, FilterParams, PaginationParams } from '../api-response';
import { HttpService } from 'src/app/services/http/http-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpService = inject(HttpService);

  /**
   * Get all users (Owner only) with pagination and filtering
   */
  public getAllUsers = (payload: PaginationParams, filter?: FilterParams): Observable<ApiResponse<User[]>> => {
    const params = new URLSearchParams();
    params.append('page', payload.page.toString());
    if (payload.limit) {
      params.append('limit', payload.limit.toString());
    }

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (key === 'sortBy' && Array.isArray(value)) {
          value.forEach((sort) => params.append('sortBy', sort));
        } else if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
    }

    return this.httpService.get<ApiResponse<User[]>>(`users?${params.toString()}`, {
      cache: true,
    });
  };

  /**
   * Get user by ID
   */
  public getUserById = (id: string): Observable<ApiResponse<User>> => {
    return this.httpService.get<ApiResponse<User>>(`users/${id}`, {
      cache: true,
    });
  };

  /**
   * Create new user (Owner only)
   */
  public createUser = (dto: CreateUserDto): Observable<ApiResponse<User>> => {
    return this.httpService.post<ApiResponse<User>>(
      'users',
      dto,
      {
        revalidatePatterns: ['*/users*'],
      }
    );
  };

  /**
   * Update user
   */
  public updateUser = (id: string, dto: UpdateUserDto): Observable<ApiResponse<User>> => {
    return this.httpService.put<ApiResponse<User>>(
      `users/${id}`,
      dto,
      {
        revalidatePatterns: ['*/users*'],
      }
    );
  };

  /**
   * Delete/Deactivate user (Owner only)
   */
  public deleteUser = (id: string): Observable<ApiResponse<any>> => {
    return this.httpService.put<ApiResponse<any>>(
      `users/${id}`,
      { isActive: false },
      {
        revalidatePatterns: ['*/users*'],
      }
    );
  };

  /**
   * Get users with their assigned orders and clients
   */
  public getUsersWithOrders = (): Observable<ApiResponse<any[]>> => {
    return this.httpService.get<ApiResponse<any[]>>('users/with-orders', {
      cache: true,
    });
  };

  /**
   * Assign multiple clients to a sales person (Owner only)
   */
  public assignClientsToSalesPerson = (salesPersonId: string, clientIds: string[]): Observable<ApiResponse<User>> => {
    return this.httpService.post<ApiResponse<User>>(
      `users/assign-clients/${salesPersonId}`,
      { clientIds },
      {
        revalidatePatterns: ['*/users*', '*/clients*'],
      }
    );
  };

  /**
   * Reassign a client from one sales person to another (Owner only)
   */
  public reassignClient = (clientId: string, newSalesPersonId: string): Observable<ApiResponse<any>> => {
    return this.httpService.put<ApiResponse<any>>(
      `users/reassign-clients/${clientId}`,
      { newSalesPersonId },
      {
        revalidatePatterns: ['*/users*', '*/clients*'],
      }
    );
  };

  /**
   * Get client options for select dropdown with isAssigned field using aggregation pipeline
   * Returns clients with isAssigned boolean calculated at database level
   * @param isAssigned - 'all' (default), 'true'/'assigned', 'false'/'unassigned'
   * Note: Response uses aggregation pipeline, does NOT include salesPerson details
   */
  public getClientOptions = (isAssigned: 'all' | 'true' | 'false' | 'assigned' | 'unassigned' = 'all'): Observable<ApiResponse<any[]>> => {
    const params = new URLSearchParams({
      isAssigned,
    });

    return this.httpService.get<ApiResponse<any[]>>(
      `users/client-options?${params.toString()}`,
      {
        cache: true,
      }
    );
  };

  /**
   * Remove a client from a sales person (Owner only)
   */
  public removeClient = (clientId: string): Observable<ApiResponse<any>> => {
    return this.httpService.delete<ApiResponse<any>>(
      `users/remove-client/${clientId}`,
      {
        revalidatePatterns: ['*/users*', '*/clients*'],
      }
    );
  };
}

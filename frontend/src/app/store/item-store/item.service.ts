import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Item, CreateItemDto, UpdateItemDto } from './item.model';
import { ApiResponse, FilterParams, PaginationParams } from '../api-response';
import { HttpService } from 'src/app/services/http/http-service';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private readonly httpService = inject(HttpService);

  /**
   * Get all items with pagination (filtered by multi-tenant: business ID)
   */
  public getAllItems = (payload: PaginationParams, filter?: FilterParams): Observable<ApiResponse<Item[]>> => {
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

    return this.httpService.get<ApiResponse<Item[]>>(`items?${params.toString()}`, {
      cache: true,
    });
  };

  /**
   * Get item by ID
   */
  public getItemById = (id: string): Observable<ApiResponse<Item>> => {
    return this.httpService.get<ApiResponse<Item>>(`items/${id}`, {
      cache: true,
    });
  };

  /**
   * Get low stock items
   */
  public getLowStockItems = (): Observable<ApiResponse<Item[]>> => {
    return this.httpService.get<ApiResponse<Item[]>>('items/low-stock', {
      cache: true,
    });
  };

  /**
   * Get expiring soon items (≤30 days)
   */
  public getExpiringItems = (): Observable<ApiResponse<Item[]>> => {
    return this.httpService.get<ApiResponse<Item[]>>('items/expiring-soon', {
      cache: true,
    });
  };

  /**
   * Get out of stock items (quantity = 0)
   */
  public getOutOfStockItems = (): Observable<ApiResponse<Item[]>> => {
    return this.httpService.get<ApiResponse<Item[]>>('items/out-of-stock', {
      cache: true,
    });
  };

  /**
   * Get items by category
   */
  public getItemsByCategory = (categoryId: string): Observable<ApiResponse<Item[]>> => {
    const params = new URLSearchParams({
      category: categoryId,
    });

    return this.httpService.get<ApiResponse<Item[]>>(`items?${params.toString()}`, {
      cache: true,
    });
  };

  /**
   * Create new item
   */
  public createItem = (dto: CreateItemDto): Observable<ApiResponse<Item>> => {
    return this.httpService.post<ApiResponse<Item>>(
      'items',
      dto,
      {
        revalidatePatterns: ['*/items*','*dashboard/summary*', '*reports*'],
      }
    );
  };

  /**
   * Update item
   */
  public updateItem = (id: string, dto: UpdateItemDto): Observable<ApiResponse<Item>> => {
    return this.httpService.put<ApiResponse<Item>>(
      `items/${id}`,
      dto,
      {
        revalidatePatterns: ['*/items*','*dashboard/summary*', '*reports*'],
      }
    );
  };

  /**
   * Delete item
   */
  public deleteItem = (id: string): Observable<ApiResponse<any>> => {
    return this.httpService.delete<ApiResponse<any>>(
      `items/${id}`,
      {
        revalidatePatterns: ['*/items*', '*dashboard/summary*', '*reports*'],
      }
    );
  };
}

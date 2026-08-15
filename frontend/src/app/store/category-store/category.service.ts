import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto } from './category.model';
import { ApiResponse, FilterParams, PaginationParams } from '../api-response';
import { HttpService } from 'src/app/services/http/http-service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly httpService = inject(HttpService);

  /**
   * Get all active categories with pagination (filtered by multi-tenant: business ID)
   */
  public getAllCategories = (payload: PaginationParams, filter?: FilterParams): Observable<ApiResponse<Category[]>> => {
    
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      params.append(key, value.toString());
    });

    if(filter && Object.keys(filter).length > 0) {
      // Handle filter - convert arrays/objects to JSON strings
      Object.entries(filter).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
  
        if (Array.isArray(value) && value.length > 0) {
          // Special handling for sortBy array of objects
          if (key === 'sortBy') {
            value.forEach((sortItem) => {
              if (typeof sortItem === 'object' && sortItem !== null) {
                params.append('sortBy[]', JSON.stringify(sortItem));
              }
            });
          } else {
            // Handle other arrays
            value.forEach((subValue) => {
              if (typeof subValue === 'string') {
                params.append(`${key}[]`, subValue);
              } else if (typeof subValue === 'object' && subValue !== null) {
                params.append(`${key}[]`, JSON.stringify(subValue));
              }
            });
          }
        } else if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Stringify objects
          params.append(key, JSON.stringify(value));
        } else if (value !== '' && value !== 0) {
          params.append(key, value.toString());
        }
      });
    }

    
    return this.httpService.get<ApiResponse<Category[]>>(`categories?${params.toString()}`, {
      cache: true,
    });
  };

  /**
   * Get category by ID
   */
  public getCategoryById = (id: string): Observable<ApiResponse<Category>> => {
    return this.httpService.get<ApiResponse<Category>>(`categories/${id}`, {
      cache: true,
    });
  };

  /**
   * Create new category (Owner only)
   */
  public createCategory = (dto: CreateCategoryDto): Observable<ApiResponse<Category>> => {
    return this.httpService.post<ApiResponse<Category>>(
      'categories',
      dto,
      {
        revalidatePatterns: ['*/categories*', '*dashboard/summary*', '*reports*', '*/items*'],
      }
    );
  };

  /**
   * Update category (Owner only)
   */
  public updateCategory = (id: string, dto: UpdateCategoryDto): Observable<ApiResponse<Category>> => {
    return this.httpService.put<ApiResponse<Category>>(
      `categories/${id}`,
      dto,
      {
        revalidatePatterns: ['*/categories*', '*dashboard/summary*', '*reports*', '*/items*'],
      }
    );
  };

  /**
   * Delete category (soft delete if has products, hard delete if no products)
   */
  public deleteCategory = (id: string): Observable<ApiResponse<any>> => {
    return this.httpService.delete<ApiResponse<any>>(
      `categories/${id}`,
      {
        revalidatePatterns: ['*/categories*', '*dashboard/summary*', '*reports*', '*/items*'],
      }
    );
  };
}



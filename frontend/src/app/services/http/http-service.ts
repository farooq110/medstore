import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError, timeout, retry, shareReplay, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

/**
 * Response wrapper for API calls
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Pagination response
 */
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    totalCount: number;
    hasMore: boolean;
    pages: number;
  };
}

/**
 * HTTP request options
 */
export interface HttpOptions {
  cache?: boolean;
  cacheTime?: number; // in milliseconds
  retries?: number;
  timeout?: number; // in milliseconds
  revalidatePatterns?: string[]; // URL patterns to revalidate on POST/PUT/PATCH/DELETE
  body?: any;
}

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  observable: Observable<T>;
}

/**
 * Cache invalidation rule
 */
interface CacheInvalidationRule {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  pattern: RegExp;
}

/**
 * Modern HTTP Service with caching, retry logic, and type safety
 * Optimized for Angular 19 and Ionic 8
 * Returns Observables for better RxJS integration
 */
@Injectable({ providedIn: 'root' })
export class HttpService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly cacheInvalidationRules: CacheInvalidationRule[] = [];

  private readonly DEFAULT_OPTIONS: HttpOptions = {
    cache: false,
    cacheTime: 2 * 60 * 1000, // 5 minutes
    retries: 0,
    timeout: 60000, // 30 seconds
  };

  /**
   * GET request with caching support - Returns Observable
   */
  get<T>(endpoint: string, options: HttpOptions = {}): Observable<T> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const url = this.buildUrl(endpoint);
    // Check cache
    if (opts.cache) {
      const cached = this.getFromCache<T>(url, opts.cacheTime!);
      if (cached) {
        return cached;
      }
    }

    // Create new observable for the request
    const request$ = this.http.get<T>(url).pipe(
      timeout(opts.timeout!),
      retry({ count: opts.retries!, delay: 1000 }),
      catchError((error) => this.handleError(error)),
      tap((data) => {
        // Store in cache after successful request
        if (opts.cache) {
          this.setCache(url, data, request$);
        }
      }),
      shareReplay(1) // Ensure multiple subscribers share the same result
    );

    // Store in cache before returning (for pending requests)
    if (opts.cache) {
      this.setCache(url, null, request$);
    }

    return request$;
  }

  /**
   * POST request with cache revalidation
   */
  post<T, B = any>(
    endpoint: string,
    body: B,
    options: HttpOptions = {}
  ): Observable<T> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const url = this.buildUrl(endpoint);

    // Register cache invalidation for related endpoints
    if (opts.revalidatePatterns) {
      this.registerCacheInvalidation(url, 'POST', opts.revalidatePatterns);
    }

    return this.http.post<T>(url, body).pipe(
      timeout(opts.timeout!),
      retry({ count: opts.retries!, delay: 1000 }),
      catchError((error) => this.handleError(error)),
      tap(() => {
        // Clear related cache entries after successful POST
        this.invalidateRelatedCache('POST', url);
      })
    );
  }

  /**
   * PUT request with cache revalidation
   */
  put<T, B = any>(
    endpoint: string,
    body: B,
    options: HttpOptions = {}
  ): Observable<T> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const url = this.buildUrl(endpoint);

    // Register cache invalidation for related endpoints
    if (opts.revalidatePatterns) {
      this.registerCacheInvalidation(url, 'PUT', opts.revalidatePatterns);
    }

    return this.http.put<T>(url, body).pipe(
      timeout(opts.timeout!),
      retry({ count: opts.retries!, delay: 1000 }),
      catchError((error) => this.handleError(error)),
      tap(() => {
        // Clear related cache entries after successful PUT
        this.invalidateRelatedCache('PUT', url);
      })
    );
  }

  /**
   * PATCH request with cache revalidation
   */
  patch<T, B = any>(
    endpoint: string,
    body: B,
    options: HttpOptions = {}
  ): Observable<T> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const url = this.buildUrl(endpoint);

    // Register cache invalidation for related endpoints
    if (opts.revalidatePatterns) {
      this.registerCacheInvalidation(url, 'PATCH', opts.revalidatePatterns);
    }

    return this.http.patch<T>(url, body).pipe(
      timeout(opts.timeout!),
      retry({ count: opts.retries!, delay: 1000 }),
      catchError((error) => this.handleError(error)),
      tap(() => {
        // Clear related cache entries after successful PATCH
        this.invalidateRelatedCache('PATCH', url);
      })
    );
  }

  /**
   * DELETE request with cache revalidation
   */
  delete<T>(endpoint: string, options: HttpOptions = {}): Observable<T> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const url = this.buildUrl(endpoint);

    // Register cache invalidation for related endpoints
    if (opts.revalidatePatterns) {
      this.registerCacheInvalidation(url, 'DELETE', opts.revalidatePatterns);
    }

    return this.http.delete<T>(url, { body: options.body }).pipe(
      timeout(opts.timeout!),
      retry({ count: opts.retries!, delay: 1000 }),
      catchError((error) => this.handleError(error)),
      tap(() => {
        // Clear related cache entries after successful DELETE
        this.invalidateRelatedCache('DELETE', url);
      })
    );
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheInvalidationRules.length = 0;
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(endpoint: string): void {
    const url = this.buildUrl(endpoint);
    this.cache.delete(url);
  }

  /**
   * Clear cache entries matching pattern
   */
  clearCacheByPattern(pattern: string | RegExp): void {
    const regex =
      typeof pattern === 'string'
        ? new RegExp(pattern.replace(/\*/g, '.*'))
        : pattern;

    for (const [key] of this.cache.entries()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Register cache invalidation rule for an endpoint
   */
  private registerCacheInvalidation(
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    patterns: string[]
  ): void {
    // Create a unique key for this endpoint and method
    const endpointKey = `${method}:${endpoint}`;

    // Remove existing rules for this endpoint and method
    this.cacheInvalidationRules.splice(
      this.cacheInvalidationRules.findIndex(
        (rule) => rule.method === method && rule.pattern.source === endpointKey
      ),
      1
    );

    // Add new rules for each pattern
    patterns.forEach((pattern) => {
      const regexPattern = pattern
        .replace(/\*/g, '.*') // Convert * to .*
        .replace(/\?/g, '.'); // Convert ? to .

      this.cacheInvalidationRules.push({
        method,
        pattern: new RegExp(`^${regexPattern}$`),
      });
    });
  }

  /**
   * Invalidate cache entries related to the operation
   */
  private invalidateRelatedCache(
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string
  ): void {
    const relatedPatterns = this.cacheInvalidationRules
      .filter((rule) => rule.method === method)
      .map((rule) => rule.pattern);

    if (relatedPatterns.length === 0) {
      // Default behavior: clear cache for the same endpoint (without query params)
      const baseUrl = endpoint.split('?')[0];
      this.clearCacheByPattern(`^${baseUrl}.*`);
    } else {
      // Clear cache for each registered pattern
      relatedPatterns.forEach((pattern) => {
        this.clearCacheByPattern(pattern);
      });
    }
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.substring(1)
      : endpoint;

    return `${environment.apiUrl}/${cleanEndpoint}`;
  }

  /**
   * Get data from cache if valid
   */
  private getFromCache<T>(
    url: string,
    cacheTime: number
  ): Observable<T> | null {
    const entry = this.cache.get(url);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > cacheTime;

    if (isExpired) {
      this.cache.delete(url);
      return null;
    }

    // If there's already data, return it as observable
    if (entry.data !== null) {
      return of(entry.data).pipe(
        catchError(() => {
          this.cache.delete(url);
          return this.get<T>(url, { cache: false });
        })
      );
    }

    // If there's a pending request observable, return it
    return entry.observable;
  }

  /**
   * Store data in cache
   */
  private setCache<T>(
    url: string,
    data: T | null,
    observable: Observable<T>
  ): void {
    this.cache.set(url, {
      data,
      timestamp: Date.now(),
      observable,
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error instanceof HttpErrorResponse) {
      // Server error
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage =
          error.error?.message ||
          `Server returned code ${error.status}: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('HTTP Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}

/**
 * Usage Example:
 *
 * @Injectable({ providedIn: 'root' })
 * export class ProductService {
 *   private readonly http = inject(HttpService);
 *
 *   // GET with caching
 *   getProducts(): Observable<Product[]> {
 *     return this.http.get<ApiResponse<Product[]>>(
 *       'products',
 *       { cache: true, cacheTime: 300000 } // 5 minutes
 *     ).pipe(
 *       map(response => response.data)
 *     );
 *   }
 *
 *   // POST with cache revalidation
 *   createProduct(product: Product): Observable<Product> {
 *     return this.http.post<ApiResponse<Product>>(
 *       'products',
 *       product,
 *       {
 *         revalidatePatterns: [
 *           'products',           // Revalidate products list
 *           'products/related', // Revalidate related products
 *           'categories/products' // Revalidate category products
 *         ]
 *       }
 *     ).pipe(
 *       map(response => response.data)
 *     );
 *   }
 *
 *   // Manual cache clearing
 *   refreshProducts(): void {
 *     this.http.clearCacheByPattern('products.*');
 *   }
 *
 *   // Usage in component
 *   loadProducts(): void {
 *     this.productService.getProducts().subscribe({
 *       next: (products) => {
 *         this.products = products;
 *       },
 *       error: (error) => {
 *         console.error('Failed to load products:', error);
 *       }
 *     });
 *   }
 *
 *   addProduct(): void {
 *     const newProduct = { name: 'New Product', price: 99.99 };
 *     this.productService.createProduct(newProduct).subscribe({
 *       next: (product) => {
 *         console.log('Product created:', product);
 *         // Cache for products list is automatically cleared
 *         // No need to manually refresh
 *       }
 *     });
 *   }
 * }
 */

/**
 * Advanced Usage with Automatic Cache Invalidation:
 *
 * 1. When creating a product, automatically clear cache for:
 *    - All product lists
 *    - Related products
 *    - Category-specific product lists
 *
 * 2. When updating a product, clear cache for:
 *    - That specific product (GET /products/{id})
 *    - Product lists that might include it
 *
 * 3. When deleting a product, clear cache for:
 *    - All product lists
 *    - Category counts
 *    - Search results
 *
 * This pattern ensures data consistency without manual cache management.
 */

import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { LocalStorageService } from '../services/local-storage/local-storage.service';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

/**
 * HTTP Token Interceptor Function
 * Automatically attaches Bearer token to API requests
 * Handles async localStorage operations with RxJS
 * Skips token for S3 URLs and public auth endpoints (login, register, forgot-password)
 * Includes token for protected auth endpoints (profile, business, current-user)
 */
export const httpTokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const ls = inject(LocalStorageService);

  // Public auth endpoints that don't need token
  const publicAuthEndpoints = [
    'auth/login',
    'auth/register',
    'auth/forgot-password',
    'auth/reset-password',
  ];

  // Check if this is a public endpoint
  const isPublicEndpoint = publicAuthEndpoints.some(endpoint =>
    req.url.includes(endpoint)
  );

  return from(ls.getItem('access_token')).pipe(
    switchMap((token) => {
      if (
        token &&
        !req.url.includes('.s3.') &&
        !isPublicEndpoint
      ) {
        req = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
      }
      return next(req);
    })
  );
};

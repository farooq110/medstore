import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { CoreService } from '../services/capacitor/core.service';
import { Store } from '@ngxs/store';
import { Logout } from '../store/auth-store';

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const zone = inject(NgZone);
  const coreService = inject(CoreService);
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 406) {
          store.dispatch(new Logout());
        coreService.showErrorToast(
          'You session has expired. Please login to continue',
        );
      }
      return throwError(() => error);
    }),
  );
};

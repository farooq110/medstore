import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, NgxsOnInit, Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { AuthStoreService } from './auth.service';
import { AuthStateModel } from './auth.model';
import {
  Login,
  LoginSuccess,
  LoginFailure,
  Logout,
  Register,
  CheckAuthStatus,
  SetAuthenticated,
  ClearAuth,
  SetLoading,
  SetError,
  ForgotPassword,
  UpdateProfile,
  UpdateBusiness,
  LoadProfile,
} from './auth.actions';
import { catchError, concatMap, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { ResetAllStores } from '../actions/store.actions';
import { HttpService } from 'src/app/services/http/http-service';
import { CoreService } from 'src/app/services/capacitor/core.service';
import { ActionOptions } from '../api-response';

const defaults: AuthStateModel = {
  user: null,
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
};

@State<AuthStateModel>({
  name: 'auth',
  defaults,
})
@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'currentUser';
  private readonly authService = inject(AuthStoreService);
  private readonly router = inject(Router);
  private readonly ls = inject(LocalStorageService);
  private readonly store = inject(Store);
  private readonly httpService = inject(HttpService);
  private readonly coreService = inject(CoreService);

  // ============ ACTIONS ============

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    const showToast = options.showToast ?? true;
    const errorMessage = options.errorMessage ?? 'Login failed';
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    ctx.patchState({ loading: true, error: null });
    
    return this.authService.login(action.payload).pipe(
      concatMap(async (response) => {
        const loginRes = response.data;

        if (loginRes?.user && loginRes?.token) {
          // Store in localStorage
          await this.ls.setItem(this.tokenKey, loginRes.token);
          await this.ls.setItem(this.userKey, JSON.stringify(loginRes.user));

          ctx.patchState({
            user: loginRes.user,
            token: loginRes.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          
          // Show success toast
          if (showToast) {
            await this.coreService.showSuccessToast('Login successful!');
          }
          
          // Redirect based on role - after state is updated
          this.redirectByRole(loginRes.user.role);
        }
        return of(null);
      }),
      catchError(async (error) => {
        const message = error?.error?.msg || errorMessage||'Invalid username or password.';

        ctx.patchState({
          loading: false,
          error: message,
          isAuthenticated: false,
        });
        
        // Show error toast
        if (showToast) {
          await this.coreService.showErrorToast(message);
        }
        
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(Register)
  register(ctx: StateContext<AuthStateModel>, action: Register) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    const showToast = options.showToast ?? true;
    
    if (isLoading) {
    this.coreService.showLoading();
    }
    ctx.patchState({ loading: true, error: null });
    
    return this.authService.register(action.payload).pipe(
      concatMap(async (response) => {
        const registerRes = response.data;
        if (registerRes?.user && registerRes?.token) {
          // Store in localStorage
          await this.ls.setItem(this.tokenKey, registerRes.token);
          await this.ls.setItem(this.userKey, JSON.stringify(registerRes.user));

          ctx.patchState({
            user: registerRes.user,
            token: registerRes.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          // Show success toast
          if (showToast) {
            await this.coreService.showSuccessToast('Registration successful!');
          }

          // Redirect to dashboard (owner) - after state is updated
          this.redirectByRole(registerRes.user.role);
        }
        return of(null);
      }),
      catchError(async (error) => {
        const message = error?.error?.msg || 'Registration failed';

        ctx.patchState({
          loading: false,
          error: message,
          isAuthenticated: false,
        });
        
        // Show error toast
        if (showToast) {
          await this.coreService.showErrorToast(message);
        }
        
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(Logout)
  async logout(ctx: StateContext<AuthStateModel>, action: Logout) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      await this.coreService.showLoading();
    }
    ctx.patchState({ loading: true });

    try {
      // Clear local storage
      await this.ls.removeItem(this.tokenKey);
      await this.ls.removeItem(this.userKey);

      // Clear HTTP cache
      this.httpService.clearCache();

      // Dispatch reset action to clear all stores
      this.store.dispatch(new ResetAllStores());

      // Reset auth state to defaults
      ctx.setState(defaults);

      // Navigate to login
      this.router.navigate(['/login']);
    } finally {
      if (isLoading) {
        await this.coreService.hideLoading();
      }
    }
  }

  @Action(CheckAuthStatus)
  async checkAuthStatus(ctx: StateContext<AuthStateModel>, action: CheckAuthStatus) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      await this.coreService.showLoading();
    }
    ctx.patchState({ loading: true });
    
    try {
      const token = await this.ls.getItem(this.tokenKey);
      const storedUser = await this.ls.getItem(this.userKey);

      if (token && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          ctx.patchState({
            user,
            isAuthenticated: true,
            token,
            loading: false,
            error: null,
          });
        } catch (e) {
          ctx.dispatch(new ClearAuth(action.options));
        }
      } else {
        ctx.patchState({ loading: false });
      }
    } finally {
      if (isLoading) {
        await this.coreService.hideLoading();
      }
    }
  }

  @Action(SetAuthenticated)
  async setAuthenticated(
    ctx: StateContext<AuthStateModel>,
    action: SetAuthenticated,
  ) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      await this.coreService.showLoading();
    }
    ctx.patchState({ loading: true });
    
    try {
      await this.ls.setItem(this.tokenKey, action.payload.token);
      await this.ls.setItem(this.userKey, JSON.stringify(action.payload.user));

      ctx.patchState({
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } finally {
      if (isLoading) {
        await this.coreService.hideLoading();
      }
    }
  }

  @Action(ClearAuth)
  async clearAuth(ctx: StateContext<AuthStateModel>, action: ClearAuth) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      await this.coreService.showLoading();
    }
    ctx.patchState({ loading: true });
    
    try {
      await this.ls.removeItem(this.tokenKey);
      await this.ls.removeItem(this.userKey);

      ctx.patchState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });

      this.router.navigate(['/login']);
    } finally {
      if (isLoading) {
        await this.coreService.hideLoading();
      }
    }
  }

  @Action(SetLoading)
  setLoading(ctx: StateContext<AuthStateModel>, action: SetLoading) {
    ctx.patchState({ loading: action.payload });
  }

  @Action(SetError)
  setError(ctx: StateContext<AuthStateModel>, action: SetError) {
    ctx.patchState({ error: action.payload });
  }

  @Action(ForgotPassword)
  forgotPassword(ctx: StateContext<AuthStateModel>, action: ForgotPassword) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    const showToast = options.showToast ?? true;

    if (isLoading) {
      this.coreService.showLoading();
    }

    ctx.patchState({ loading: true, error: null });

    return this.authService.forgotPassword(action.payload.email).pipe(
      tap(async (res) => {
        ctx.patchState({ loading: false, error: null });
        if (showToast && res.success) {
          await this.coreService.showSuccessToast(res.message || 'Password reset link sent. Check your email.');
        }
      }),
      catchError(async (error) => {
        const message = error.error?.msg || 'Failed to send password reset link';
        ctx.patchState({ loading: false, error: message });
        if (showToast) {
          await this.coreService.showErrorToast(message);
        }
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(UpdateProfile)
  updateProfile(ctx: StateContext<AuthStateModel>, action: UpdateProfile) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    const showToast = options.showToast ?? true;
    const successMessage = options.successMessage ?? 'Profile updated successfully';
    const errorMessage = options.errorMessage ?? 'Failed to update profile';

    if (isLoading) {
      this.coreService.showLoading();
    }

    ctx.patchState({ loading: true, error: null });

    return this.authService.updateProfile(action.payload).pipe(
      tap(async (res) => {
        if (res.success && res.data) {
          const currentState = ctx.getState();
          ctx.patchState({
            user: res.data,
            loading: false,
            error: null,
          });
          // Update localStorage
          await this.ls.setItem(this.userKey, JSON.stringify(res.data));
          if (showToast) {
            await this.coreService.showSuccessToast(successMessage);
          }
        }
      }),
      catchError(async (error) => {
        const message = error.error?.msg || error.message || errorMessage;
        ctx.patchState({ loading: false, error: message });
        if (showToast) {
          await this.coreService.showErrorToast(message);
        }
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(UpdateBusiness)
  updateBusiness(ctx: StateContext<AuthStateModel>, action: UpdateBusiness) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    const showToast = options.showToast ?? true;
    const successMessage = options.successMessage ?? 'Business profile updated successfully';
    const errorMessage = options.errorMessage ?? 'Failed to update business profile';

    if (isLoading) {
      this.coreService.showLoading();
    }

    ctx.patchState({ loading: true, error: null });

    return this.authService.updateBusiness(action.payload).pipe(
      tap(async (res) => {
        if (res.success && res.data) {
          const currentState = ctx.getState();
          const currentUser = currentState.user;
          if (currentUser) {
            const updatedUser = { ...currentUser, business: res.data };
            ctx.patchState({
              user: updatedUser,
              loading: false,
              error: null,
            });
            // Update localStorage
            await this.ls.setItem(this.userKey, JSON.stringify(updatedUser));
          }
          if (showToast) {
            await this.coreService.showSuccessToast(successMessage);
          }
        }
      }),
      catchError(async (error) => {
        const message = error.error?.msg || error.message || errorMessage;
        ctx.patchState({ loading: false, error: message });
        if (showToast) {
          await this.coreService.showErrorToast(message);
        }
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(LoadProfile)
  loadProfile(ctx: StateContext<AuthStateModel>, action: LoadProfile) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    const showToast = options.showToast ?? false;
    const errorMessage = options.errorMessage ?? 'Failed to load profile';

    if (isLoading) {
      this.coreService.showLoading();
    }

    ctx.patchState({ loading: true, error: null });

    return this.authService.getProfile().pipe(
      tap(async (res) => {
        if (res.success && res.data) {
          ctx.patchState({
            user: res.data,
            loading: false,
            error: null,
          });
          // Update localStorage with fresh data
          await this.ls.setItem(this.userKey, JSON.stringify(res.data));
          if (showToast) {
            await this.coreService.showSuccessToast('Profile loaded successfully');
          }
        }
      }),
      catchError(async (error) => {
        const message = error.error?.msg || error.message || errorMessage;
        ctx.patchState({ loading: false, error: message });
        if (showToast) {
          await this.coreService.showErrorToast(message);
        }
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  private redirectByRole(role: string) {
    switch (role) {
      case 'owner':
        this.router.navigate(['/owner/dashboard']);
        break;
      case 'sales_person':
        this.router.navigate(['/sales/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}

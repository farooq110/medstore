import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/services/http/http-service';
import { ApiResponse } from '../api-response';
import { AuthUser, Business, LoginDto, LoginResponse, RegisterDto, RegisterResponse } from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthStoreService {
  private readonly httpService = inject(HttpService);

  /**
   * Register new user (owner) with business
   * Returns ApiResponse containing user, token, and business
   */
  public register = (dto: RegisterDto): Observable<ApiResponse<RegisterResponse>> => {
    return this.httpService.post<ApiResponse<RegisterResponse>>(
      'auth/register',
      dto
    );
  };

  /**
   * Login with email and password
   * Returns ApiResponse containing user and token
   */
  public login = (dto: LoginDto): Observable<ApiResponse<LoginResponse>> => {
    return this.httpService.post<ApiResponse<LoginResponse>>(
      'auth/login',
      dto
    );
  };

  /**
   * Get current authenticated user (cached)
   */
  public getCurrentUser = (): Observable<ApiResponse<AuthUser>> => {
    return this.httpService.get<ApiResponse<AuthUser>>('auth/current-user', {
      cache: true,
    });
  };

  /**
   * Fetch fresh user profile data from server (no cache)
   * Used when navigating to profile page to get latest data
   */
  public getProfile = (): Observable<ApiResponse<AuthUser>> => {
    return this.httpService.get<ApiResponse<AuthUser>>('auth/me', {
      cache: false,
      revalidatePatterns: [],
    });
  };

  /**
   * Logout current user. Revalidates related caches when successful.
   */
  public logout = (): Observable<ApiResponse<any>> => {
    return this.httpService.post<ApiResponse<any>>('auth/logout', {}, {
      revalidatePatterns: ['*/users*', '*/clients*', '*dashboard/summary*', '*reports*', '*/orders*', '*/items*', '*/categories*', '*/suppliers*', '*/expenses*'],
    });
  };

  /**
   * Request password reset link
   * Sends reset link to user's email
   */
  public forgotPassword = (email: string): Observable<ApiResponse<any>> => {
    return this.httpService.post<ApiResponse<any>>('auth/forgot-password', { email });
  };

  /**
   * Update user profile (name, phone, password)
   */
  public updateProfile = (dto: { name?: string; phone?: string; password?: string; oldPassword?: string }): Observable<ApiResponse<AuthUser>> => {
    return this.httpService.patch<ApiResponse<AuthUser>>('auth/profile', dto, {
      revalidatePatterns: ['*/auth*', '*/users*'],
    });
  };

  /**
   * Update business profile (name, phone, address, website, country)
   */
  public updateBusiness = (dto: { name?: string; phone?: string; address?: string; website?: string; country?: string }): Observable<ApiResponse<Business>> => {
    return this.httpService.patch<ApiResponse<Business>>('business', dto, {
      revalidatePatterns: ['*/auth*', '*/users*', '*/business*'],
    });
  };
}

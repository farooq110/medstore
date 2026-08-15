/**
 * Auth Store Selectors
 * Organized selectors class for cleaner imports and consistent pattern with other stores
 */
import { Selector } from '@ngxs/store';
import { AuthState } from './auth.state';
import { AuthUser, AuthStateModel, Business } from './auth.model';

export class AuthSelectors {
  @Selector([AuthState])
  static user(state: AuthStateModel): AuthUser | null {
    return state.user;
  }

  @Selector([AuthState])
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector([AuthState])
  static token(state: AuthStateModel): string | null {
    return state.token;
  }

  @Selector([AuthState])
  static loading(state: AuthStateModel): boolean {
    return state.loading;
  }

  @Selector([AuthState])
  static error(state: AuthStateModel): string | null {
    return state.error;
  }

  @Selector([AuthState])
  static userRole(state: AuthStateModel): string | null {
    return state.user?.role || null;
  }

  @Selector([AuthState])
  static isOwner(state: AuthStateModel): boolean {
    return state.user?.role === 'owner';
  }

  @Selector([AuthState])
  static isSalesPerson(state: AuthStateModel): boolean {
    return state.user?.role === 'sales_person';
  }

  @Selector([AuthState])
  static isAdmin(state: AuthStateModel): boolean {
    return state.user?.role === 'admin';
  }

  @Selector([AuthState])
  static userEmail(state: AuthStateModel): string | null {
    return state.user?.email || null;
  }

  @Selector([AuthState])
  static userName(state: AuthStateModel): string | null {
    return state.user?.name || null;
  }

  @Selector([AuthState])
  static userBusiness(state: AuthStateModel): string | Business | null {
    return state.user?.business || null;
  }
}

// ============ EXPORT NAMED SELECTORS FOR CONVENIENCE ============
// These can be used as: select(selectAuthUser), select(selectIsAuthenticated), etc.
export const selectAuthUser = AuthSelectors.user;
export const selectIsAuthenticated = AuthSelectors.isAuthenticated;
export const selectAuthToken = AuthSelectors.token;
export const selectAuthLoading = AuthSelectors.loading;
export const selectAuthError = AuthSelectors.error;
export const selectUserRole = AuthSelectors.userRole;
export const selectIsOwner = AuthSelectors.isOwner;
export const selectIsSalesPerson = AuthSelectors.isSalesPerson;
export const selectIsAdmin = AuthSelectors.isAdmin;
export const selectUserEmail = AuthSelectors.userEmail;
export const selectUserName = AuthSelectors.userName;
export const selectUserBusiness = AuthSelectors.userBusiness;

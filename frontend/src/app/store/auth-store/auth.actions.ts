import { AuthUser, LoginDto, LoginResponse, RegisterDto, RegisterResponse } from './auth.model';
import { ActionOptions } from '../api-response';

// ============ LOGIN & AUTHENTICATION ACTIONS ============
export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: LoginDto, public options?: ActionOptions) {}
}

export class LoginSuccess {
  static readonly type = '[Auth] Login Success';
  constructor(public payload: LoginResponse) {}
}

export class LoginFailure {
  static readonly type = '[Auth] Login Failure';
  constructor(public payload: string) {}
}

export class Register {
  static readonly type = '[Auth] Register';
  constructor(public payload: RegisterDto, public options?: ActionOptions) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
  constructor(public options?: ActionOptions) {}
}

export class CheckAuthStatus {
  static readonly type = '[Auth] Check Auth Status';
  constructor(public options?: ActionOptions) {}
}

// ============ AUTH STATE MANAGEMENT ACTIONS ============
export class SetAuthenticated {
  static readonly type = '[Auth] Set Authenticated';
  constructor(public payload: { user: AuthUser; token: string }, public options?: ActionOptions) {}
}

export class ClearAuth {
  static readonly type = '[Auth] Clear Auth';
  constructor(public options?: ActionOptions) {}
}

export class SetLoading {
  static readonly type = '[Auth] Set Loading';
  constructor(public payload: boolean) {}
}

export class SetError {
  static readonly type = '[Auth] Set Error';
  constructor(public payload: string | null) {}
}

export class ForgotPassword {
  static readonly type = '[Auth] Forgot Password';
  constructor(public payload: { email: string }, public options?: ActionOptions) {}
}

export class UpdateProfile {
  static readonly type = '[Auth] Update Profile';
  constructor(public payload: { name?: string; phone?: string; password?: string; oldPassword?: string }, public options?: ActionOptions) {}
}

export class UpdateBusiness {
  static readonly type = '[Auth] Update Business';
  constructor(public payload: { name?: string; phone?: string; address?: string; website?: string; country?: string; ntn?: string; logo?: string }, public options?: ActionOptions) {}
}

export class LoadProfile {
  static readonly type = '[Auth] Load Profile';
  constructor(public options?: ActionOptions) {}
}
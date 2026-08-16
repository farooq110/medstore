export interface Business {
  id?: string;
  _id?: string;
  name: string;
  phone?: string;
  address?: string;
  website?: string;
  country: string;
  logo?: string;
  ntn?: string;
  [key: string]: any;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'sales_person' | 'admin';
  business: string | Business; // Multi-tenant: business ID or business object
  status?: string;
  phone?: string;
  [key: string]: any;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  country: string;
  ntn?: string;
  logo?: string;
}

export interface RegisterResponse {
  user: AuthUser;
  token: string;
  business: {
    id: string;
    name: string;
  };
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  business?: {
    id: string;
    name: string;
  };
}

export interface AuthStateModel {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}


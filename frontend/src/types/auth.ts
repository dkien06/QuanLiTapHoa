export type UserRole = 'OWNER';
export type StoreType = 'GROCERY' | 'SUPPLIER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  role: UserRole;
  storeId: string;
  storeType: StoreType;
  storeName: string;
  storeAddress: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  fullName: string;
  phone: string;
  storeName: string;
  storeType: StoreType;
  storePhone: string;
  storeAddress: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface AuthErrorDetail {
  code?: string;
  message?: string;
  fields?: Record<string, string>;
}

export interface FastApiValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface AuthErrorResponse {
  detail?: AuthErrorDetail | string | FastApiValidationErrorItem[];
}

export interface AuthError extends Error {
  code?: string;
  fields?: Record<string, string>;
  status?: number;
}
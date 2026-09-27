export type UserRole = 'GROCERY_OWNER' | 'SUPPLIER_OWNER';

export interface User {
  id: number;
  username: string;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
  storeName?: string;
  storeAddress?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  role: UserRole;
}

export interface RegisterCredentials {
  fullName: string;
  phone: string;
  email?: string;
  username: string;
  password: string;
  role: UserRole;
  storeName: string;
  storePhone?: string;
  storeAddress?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

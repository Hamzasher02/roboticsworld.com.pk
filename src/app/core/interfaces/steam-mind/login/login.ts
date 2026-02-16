export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginUser[]; // login response array
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: LoginUser | LoginUser[]; // ✅ sometimes backend object, sometimes array
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  raw?: any;
}

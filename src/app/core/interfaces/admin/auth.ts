export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginUserData | LoginUserData[];
}

/** ✅ server session check response (match your backend) */
export interface MeResponse {
  success: boolean;
  data: LoginUserData; // { role, firstName, lastName }
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type ChangePasswordResponse = ApiResponse<Record<string, never>>;

export interface VerifyEmailPayload {
  email: string;
  otp: string; 
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string | string[];
  data?: any[];
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
    data: any[];
}

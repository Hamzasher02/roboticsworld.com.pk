export type UserRole = 'student' | 'instructor';

export interface SignupForm {
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  consentAccepted: boolean;
}

export interface SignupDraft extends SignupForm {
  id: string;
  createdAt: number;
}

export interface SignupFlowState {
  draft: SignupDraft | null;
  role: UserRole | null;
}

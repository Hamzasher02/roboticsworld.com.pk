/**
 * Student Authentication Interfaces
 * Used for student registration, email verification, and login flows.
 * 
 * IMPORTANT: These interfaces are student-specific and do NOT affect instructor auth.
 */

/**
 * Payload for student registration.
 * Backend endpoint: POST /auth/register/student (multipart/form-data)
 * 
 * Field names must match backend exactly.
 */
export interface StudentRegisterPayload {
    // Personal
    firstName: string;
    lastName: string;
    fatherName: string;
    email: string;
    password: string;
    phoneNumber: string;
    dateOfBirth: string; // YYYY-MM-DD
    bio: string;

    // Meta
    consentAccepted: boolean;

    // Student Specific
    parentPhoneNumber: string;
    ageGroup: string;
    age: string | number;

    // Residence
    address: string;
    city: string;
    country: string;
    postalCode: string | number;

    // Emergency
    fullName: string; // Emergency contact name
    relationship: string;
    emergencyPhoneNumber: string;

    // Optional file
    profilePicture?: File;
}

/**
 * Response from student registration endpoint.
 */
export interface StudentRegisterResponse {
    success: boolean;
    message: string;
    data?: {
        user?: {
            _id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
        verificationRequired?: boolean;
    };
}

/**
 * Payload for email verification.
 * Backend endpoint: POST /auth/verifyEmailAddress
 */
export interface VerifyEmailPayload {
    email: string;
    otp: string;
}

/**
 * Response from email verification endpoint.
 */
export interface VerifyEmailResponse {
    success: boolean;
    message: string;
    data?: {
        verified?: boolean;
    };
}

/**
 * Payload for student login.
 * Backend endpoint: POST /auth/login/users
 */
export interface StudentLoginPayload {
    email: string;
    password: string;
}

/**
 * Response from login endpoint.
 */
export interface StudentLoginResponse {
    success: boolean;
    message: string;
    data?: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        profilePicture?: string;
    }[];
}

/**
 * API Error structure for student auth operations.
 */
export interface StudentAuthError {
    success: false;
    statusCode: number;
    message: string;
    errors?: Record<string, string[]>;
    raw?: unknown;
}

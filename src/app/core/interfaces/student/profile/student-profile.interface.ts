export interface StudentProfileResponse {
    firstName: string;
    lastName: string;
    email: string;
    parentPhoneNumber?: string;
    phoneNumber?: string;
    grade?: string;
    bio?: string;
    profilePicture?: string | { secureUrl: string };
}

export interface StudentUpdatePayload {
    parentPhoneNumber?: string;
    phoneNumber?: string;
    grade?: string;
    bio?: string;
    profilePicture?: string;
}

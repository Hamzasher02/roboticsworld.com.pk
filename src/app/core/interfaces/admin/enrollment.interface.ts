export interface EnrollmentUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePicture?: {
        secureUrl: string;
        publicId: string;
    };
    id: string;
}

export interface EnrollmentCourse {
    _id: string;
    courseTitle: string;
    coursePrice: string;
    courseCategory: string[];
    courseThumbnail?: {
        secureUrl: string;
        publicId: string;
    };
}

export interface Enrollment {
    _id: string;
    isSessionAssigned: boolean;
    user: EnrollmentUser;
    course: EnrollmentCourse;
    enrollmentType: string;
    preferredClassTime?: string;
    invoiceNumber: string;
    enrollmentStatus: string;
    rejectReason?: string | null;
    approvedAt?: string;
    createdAt: string;
    paymentScreenshot?: {
        secureUrl: string;
        publicId: string;
    };
}

export interface GetAllEnrollmentsResponse {
    success: boolean;
    count: number;
    message: string;
    pagination: {
        total: number;
        pages: number;
        currentPage: number;
        limit: number;
    };
    data: Enrollment[];
}

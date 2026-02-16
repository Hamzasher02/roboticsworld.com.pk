export type EnrollmentType = 'Live Classes' | 'Recorded Classes';

export interface EnrollLiveCourse {

    courseId: string;
    enrollmentType?: EnrollmentType;
    preferredClassTime?: string;
    invoiceNumber?: string;
    paymentScreenshot?: File;
}

export interface CreateEnrollmentResponse {
    success: boolean;
    message: string;
    data?: any;
}



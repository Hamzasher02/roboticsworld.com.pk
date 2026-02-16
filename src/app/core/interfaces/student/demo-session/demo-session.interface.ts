/**
 * Demo session interfaces for demo session requests.
 */

export type DemoSessionStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface DemoSession {
    _id: string;
    studentId: string;
    category: string;
    subcategory: string;
    courseId: string;
    preferredDate: string;
    preferredTime?: string;
    status: DemoSessionStatus;
    rejectReason?: string | null;
    instructorId?: string | null;
    demoSessionLink?: string | null;
    approvedDate?: string | null;
    approvedBy?: string | null;
    rejectedBy?: string | null;
    rejectedAt?: string | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    course?: {
        _id: string;
        courseTitle: string;
        courseThumbnail?: {
            publicId: string;
            secureUrl: string;
        };
        courseCategory?: string[];
        courseSubCategory?: string;
        coursePrice?: string;
    };
    instructor?: {
        _id: string;
        firstName: string;
        lastName: string;
        email?: string;
        phoneNumber?: string;
        profilePicture?: {
            secureUrl: string;
            publicId: string;
        };
    } | null;
}

export interface CreateDemoSessionRequest {
    courseId?: string;
    preferredDate: string;
    preferredTime?: string;
    notes?: string;
}

export interface DemoSessionResponse {
    demoSession: DemoSession;
}

export interface DemoSessionListResponse {
    demoSessions: DemoSession[];
    total?: number;
}

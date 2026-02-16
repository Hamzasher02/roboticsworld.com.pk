// session interfaces

export type SessionStatus = 'scheduled' | 'ongoing' | 'completed' | 'canceled';

export interface CourseSession {
    _id: string;
    course: {
        _id: string;
        courseTitle: string;
    };
    enrollment: {
        _id: string;
        user: string;
        course: string;
        enrollmentType: string;
        preferredClassTime: string;
        invoiceNumber?: string;
        enrollmentStatus: string;
        approvedAt?: string;
        isDeleted: boolean;
        createdAt: string;
        updatedAt: string;
    };
    instructor: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        id: string;
    };
    student: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    sessionLink?: string;
    sessionNumber?: number;
    totalSessions?: number;
    sessionStatus: SessionStatus;
    notes?: string | null;
    createdBy?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SessionPagination {
    page: number;
    limit: number;
    total: number;
    pages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
}

export interface SessionsResponse {
    success: boolean;
    message: string;
    data: CourseSession[];
    pagination: SessionPagination;
}

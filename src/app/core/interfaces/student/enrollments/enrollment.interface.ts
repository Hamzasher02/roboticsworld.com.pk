// enrollment interfaces
import { Course, CourseModule, CourseLecture, CoursePdf } from '../course/course.interface';

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';
export type EnrollmentType = 'Live Classes' | 'Recorded Lectures';

export interface PaymentScreenshot {
    publicId: string;
    secureUrl: string;
}

export interface Enrollment {
    _id: string;
    user: string | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
        profilePicture?: { secureUrl: string; publicId: string };
    };
    course: string | Course;
    enrollmentType: EnrollmentType;
    preferredClassTime?: string | null;
    paymentScreenshot: PaymentScreenshot;
    invoiceNumber?: string | null;
    enrollmentStatus: EnrollmentStatus;
    rejectReason?: string | null;
    approvedBy?: string | null;
    approvedAt?: string | null;
    rejectedBy?: string | null;
    rejectedAt?: string | null;
    isDeleted: boolean;
    deletedAt?: string | null;
    deletedBy?: string | null;
    restoredAt?: string | null;
    restoredBy?: string | null;
    completedLectures?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface EnrollmentStatusCheck {
    isEnrolled: boolean;
    enrollment?: Enrollment;
}

export interface CreateEnrollmentRequest {
    enrollmentType: EnrollmentType;
    preferredClassTime?: string;
    invoiceNumber?: string;
    paymentScreenshot: File;
}

export interface EnrolledCourseData {
    enrollment: Enrollment;
    course: any;
    modules: any[];
    progress?: {
        completed: number;
        total: number;
        percentage: number;
    };
    sessions?: any[];
    learningOutcomes?: any[];
    lectures?: any[];
    pdfMaterials?: any[];
    quizzes?: any[];
}

export interface ModuleDetail {
    module: CourseModule;
    lectures: CourseLecture[];
    pdfs: CoursePdf[];
    progress?: {
        completedLectures: string[];
        completedPdfs: string[];
    };
}

export interface LectureDetail {
    lecture: CourseLecture;
    videoUrl: string;
    nextLecture?: CourseLecture;
    previousLecture?: CourseLecture;
    isCompleted?: boolean;
}

export interface PdfDetail {
    pdf: CoursePdf;
    pdfUrl: string;
    isCompleted?: boolean;
}

export interface EnrollmentListResponse {
    enrollments: Enrollment[];
    total?: number;
}

export interface PdfMaterial {
    _id: string;
    title: string;
    size?: string;
    uploadDate?: string;
}

export interface ModuleWithMaterials {
    _id: string;
    moduleName: string;
    materials: PdfMaterial[];
}

export interface LectureItem {
    _id: string;
    title: string;
    duration?: string;
    completed?: boolean;
}

export interface ModuleWithLectures {
    _id: string;
    moduleName: string;
    moduleDescription: string;
    completed: boolean;
    moduleIndex: number;
    lectures: LectureItem[];
}

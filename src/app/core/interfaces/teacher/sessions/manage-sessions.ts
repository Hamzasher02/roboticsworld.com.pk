export type ApiFileRef = {
  publicId: string;
  secureUrl: string;
};

export type ApiSessionCourse = {
  _id: string;
  courseTitle: string;
  
};

export type ApiSessionStudent = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  id?: string;
  profilePicture?: ApiFileRef; // sometimes comes in other endpoint
};

export type ApiEnrollment = {
  _id: string;
  enrollmentType?: string;         // "Live Classes"
  preferredClassTime?: string;     // "10:00 AM - 11:30 AM"
  enrollmentStatus?: string;       // "approved"
  approvedAt?: string | null;
};

export type ApiInstructorSessionItem = {
  _id: string;

  course: ApiSessionCourse;
  enrollment: ApiEnrollment;

  instructor: string;
  student: ApiSessionStudent;

  sessionDate: string; // "2025-12-25"
  startTime: string;   // "14:00"
  endTime: string;     // "15:00"

  sessionLink?: string;
  sessionNumber: number;
  totalSessions: number;

  sessionStatus: string; // "scheduled" etc
  notes?: string | null;

  createdAt: string;
  updatedAt: string;
};

export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type GetInstructorMySessionsResponse = {
  success: boolean;
  message: string;
  data: ApiInstructorSessionItem[];
  pagination?: ApiPagination;
};
export type ApiSessionDetailModule = {
  _id: string;
  moduleName: string;
  moduleDescription: string | null;
  noOfSession: number | null;
  sessionDuration: number;
  moduleIndex: number;
  isCompleted: boolean;
  completedAt: string | null;
  notes: string | null;
};

export type ApiSessionDetail = {
  _id: string;
  course: ApiSessionCourse;
  enrollment: string;
  instructor: string;
  student: ApiSessionStudent;
  sessionDate: string;
  startTime: string;
  endTime: string;
  sessionLink?: string;
  sessionNumber: number;
  totalSessions: number;
  sessionStatus: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetInstructorSessionModulesDetailResponse = {
  success: boolean;
  message: string;
  data: {
    session: ApiSessionDetail;
    modules: ApiSessionDetailModule[];
  };
};
export type MarkModuleCompleteResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    enrollment: string;
    course: string;
    student: string;
    module: string;
    completedAt: string | null;
    completedBy: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    isCompleted: boolean;
    isDeleted: boolean;
    notes: string | null;
    __v?: number;
  };
};


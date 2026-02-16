export interface ApiFileRef {
  publicId: string;
  secureUrl: string;
}

export interface ApiCourseCreator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export interface ApiAssignedInstructor {
  instructor: string;
  assignedBy: string;
  assignedAt: string; // ISO
  _id: string;
}

export interface ApiAssignedCourse {
  _id: string;

  courseTitle: string;
  courseCategory: string[];

  courseSubCategory: string;
  courseAgeGroup: string;
  courseLevel: string;

  courseAccess: string;
  coursePrice: string;

  courseVisibility: boolean;
  isCoursePublished: boolean;

  courseThumbnail?: ApiFileRef;
  courseOutline?: ApiFileRef;

  createdBy: ApiCourseCreator;
  assignedInstructors: ApiAssignedInstructor[];

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface ApiPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  limit: number;
}

export interface GetMyAssignedCoursesResponse {
  success: boolean;
  message: string;
  data: ApiAssignedCourse[];
  pagination?: ApiPaginationMeta;
}

export interface GetCourseByIdResponse {
  success: boolean;
  message: string;
  data: ApiAssignedCourse;
}

// ======================
// ✅ NEW: Course Modules
// ======================
export interface ApiCourseModule {
  _id: string;
  moduleName: string;
  moduleDescription: string | null;
  noOfSession: number | null;
  sessionDuration: number | null;
  completed: boolean;
  moduleCourse: string;
  createdBy: string;
  moduleIndex: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetCourseModulesResponse {
  success: boolean;
  message: string;
  data: ApiCourseModule[];
}

// ======================
// ✅ NEW: Students Progress
// ======================
export interface ApiStudentProgressItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: ApiFileRef;
  totalModules: number;
  modulesMarkedComplete: number;
}

export interface GetCourseStudentsResponse {
  success: boolean;
  message: string;
  data: ApiStudentProgressItem[];
}

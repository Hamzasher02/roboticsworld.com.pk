export interface ApiFile {
  secureUrl: string;
  publicId: string;
}

export interface InstructorNested {
  coursePreferences: string[];
}

export interface InstructorApiItem {
  firstName: string;
  lastName: string;
  email: string;
  accountStatus?: string; // ✅ ADD THIS (active/pending/inactive)
  profilePicture?: ApiFile;
  instructor?: InstructorNested;
  _id: string; // ✅ ADD THIS
}

export interface GetAllInstructorsResponse {
  success: boolean;
  message: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalInstructors: number;
    limit: number;
  };
  data: InstructorApiItem[];
}

/** ✅ UI model (NO id) */
export interface InstructorListItem {
  profilePictureUrl: string | null;
  name: string;
  email: string;
  courseIds: string[];
}
export interface CourseMin {
  _id: string;
  courseTitle: string;
}

export interface GetAllCoursesResponse {
  success: boolean;
  message?: string;
  data: CourseMin[];
}
export interface User {
  name: string;
  email: string;
  course: string;
  status: string;
  avatar: string;
  id: string; // ✅ ADD THIS
  selected?: boolean;
}

export interface StatusUpdateResponse {
  success: boolean;
  message: string;
  data: any;
}
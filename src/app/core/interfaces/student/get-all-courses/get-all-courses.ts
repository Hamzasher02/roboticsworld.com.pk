export interface GetAllCoursesResponse {
  success: boolean;
  message: string;
  data: Course[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    limit: number;
  };
}

export interface Course {
  _id: string;
  courseTitle: string;
  courseCategory: string[];
  courseVisibility: boolean;
  isCoursePublished: boolean;
  courseSubCategory: string;
  courseAgeGroup: string;
  courseLevel: string;
  courseAccess: string;
  coursePrice: string;
  courseEnrollementType?: string;
  createdBy: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  restoredAt: string | null;
  restoredBy: string | null;
  assignedInstructors: AssignedInstructor[];
  courseThumbnail: Media;
  courseOutline: Media;
  courseOverview: CourseOverview;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Media {
  publicId: string;
  secureUrl: string;
}

export interface CourseOverview {
  courseDescription: string | null;
  courseDuration: string | null;
  coursePrerequisite: string | null;
  courseTargetAudience: string | null;
}

export interface AssignedInstructor {
  _id: string;
  instructor: string;
  assignedBy: string;
  assignedAt: string;
}

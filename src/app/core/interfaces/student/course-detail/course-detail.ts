// course-detail.model.ts

export interface CourseDetailResponse {
  success: boolean;
  message: string;
  data: CourseDetailData;
}

export interface CourseDetailData {
  course: Course;
  curriculum: CurriculumModule[];
  learningOutcomes: LearningOutcome[];
  feedbacks: Feedback[];
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
  price?: number;
  discountPrice?: number;
  discount?: number; // Added percentage
  createdBy: Creator;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  restoredAt: string | null;
  restoredBy: string | null;
  assignedInstructors: AssignedInstructorDetail[];
  instructors?: InstructorInfo[];
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

export interface Creator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: Media;
}

export interface AssignedInstructorDetail {
  _id: string;
  assignedBy: string;
  assignedAt: string;
  instructor: Instructor;
}

export interface Instructor {
  _id: string;
  firstName: string;
  lastName: string;
  id: string;
  profilePicture: Media;
}

export interface InstructorInfo {
  _id: string;
  name: string;
  profilePicture?: string;
}

export interface CurriculumModule {
  _id: string;
  moduleName: string;
  moduleDescription: string | null;
  noOfSession: number | null;
  sessionDuration: number;
  completed: boolean;
  moduleCourse: string;
  createdBy: string;
  moduleIndex: number;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  restoredAt: string | null;
  restoredBy: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lessons?: { lessonName: string }[];
}

export interface LearningOutcome {
  _id: string;
  outcomeDescription: string;
  belongTo: string;
  createdBy: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  restoredAt: string | null;
  restoredBy: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Feedback {

}


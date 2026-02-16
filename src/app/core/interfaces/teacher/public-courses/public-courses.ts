export interface PublicCourseMin {
  _id: string;
  courseTitle: string;
}

export interface PublicCoursesMinResponse {
  success: boolean;
  message: string;
  data: PublicCourseMin[];
}

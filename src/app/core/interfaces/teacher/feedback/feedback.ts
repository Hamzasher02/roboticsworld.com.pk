export type ApiFileRef = {
  secureUrl: string;
  publicId: string;
};

export type ApiFeedbackUser = {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: ApiFileRef;
};

export type ApiCourseRef = {
  _id?: string;
  courseTitle?: string;
  courseThumbnail?: ApiFileRef;
};

export type ApiCourseFeedbackItem = {
  _id: string;

  user?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: { secureUrl?: string };
  };

  // ✅ instructor-wise API returns this
  course?: ApiCourseRef;

  feedbackText?: string;
  rating?: number;
  createdAt?: string;
};

export type GetCourseFeedbacksResponse = {
  success: boolean;
  message: string;
  data: ApiCourseFeedbackItem[];
};

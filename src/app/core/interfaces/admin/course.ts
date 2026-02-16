export interface CourseThumbnail {
    publicId: string;
    secureUrl: string;
}

export interface CourseOutline {
    publicId: string;
    secureUrl: string;
}

export interface Course {
    _id: string;
    courseTitle: string;
    courseCategory: string[];
    courseSubCategory: string;
    courseLevel: string;
    courseAgeGroup: string;
    coursePrice: string;
    courseAccess: string;
    courseEnrollementType: string;
    courseVisibility: boolean;
    isCoursePublished: boolean;
    courseThumbnail?: CourseThumbnail;
    courseOutline?: CourseOutline;
    createdAt: string;
    updatedAt?: string;
}

export interface CourseCatalogResponse {
    success: boolean;
    type: string;
    data: {
        courses: Course[];
        bundles: any[];
    };
}

export interface CreateCourseResponse {
    success: boolean;
    message: string;
    data: Course[];
}

export interface CreateCoursePayload {
    courseTitle: string;
    courseCategory: string; // name
    courseSubCategory: string;
    courseLevel: string;
    courseAgeGroup: string;
    courseAccess: string;
    coursePrice: string;
    courseEnrollementType: string;
    thumbnailFile: File;
    outlinePdf: File;
}

// course interfaces

export interface CourseInstructor {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    bio?: string;
}

export interface CourseModule {
    _id: string;
    title: string;
    description?: string;
    order: number;
    lectures?: CourseLecture[];
    pdfs?: CoursePdf[];
}

export interface CourseLecture {
    _id: string;
    title: string;
    description?: string;
    duration?: number;
    videoUrl?: string;
    order: number;
}

export interface CoursePdf {
    _id: string;
    title: string;
    pdfUrl: string;
    order: number;
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    shortDescription?: string;
    thumbnail?: string;
    price: number;
    courseEnrollementType?: string;
    discountPrice?: number;
    currency?: string;
    category?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    duration?: number;
    totalLectures?: number;
    totalModules?: number;
    language?: string;
    instructor?: CourseInstructor;
    modules?: CourseModule[];
    requirements?: string[];
    learningOutcomes?: string[];
    tags?: string[];
    rating?: number;
    totalReviews?: number;
    totalEnrollments?: number;
    isPublished?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CourseListResponse {
    courses: Course[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface CourseDetailResponse {
    course: Course;
}

export interface CourseQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    level?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    [key: string]: string | number | boolean | undefined;
}


export interface CourseThumbnail {
    publicId: string;
    secureUrl: string;
}

export interface AdminCourse {
    _id: string;
    courseTitle: string;
    courseCategory: string;
    courseSubCategory: string;
    courseAgeGroup: string;
    courseLevel: string;
    courseAccess: string;
    coursePrice: string;
    courseEnrollementType: string;
    courseVisibility: boolean;
    isCoursePublished: boolean;
    courseThumbnail: CourseThumbnail;
    createdAt: string;
}

export interface AdminBundle {
    _id: string;
    bundleName: string;
    category: string;
    ageGroup: string;
    level: string;
    access: string;
    price: string;
    priceAfterDiscount: string;
    visibility: string; // Active | Inactive
    bundleThumbnail?: CourseThumbnail;
    thumbnail?: string; // New field from API
    courses: string[];
    createdAt: string;
}

export interface AdminCourseCatalogResponse {
    success: boolean;
    type: string;
    data: {
        courses: AdminCourse[];
        bundles: AdminBundle[];
    };
}

export interface AdminCatalogParams {
    type: string;
    category?: string;
    status?: string;
    priceMin?: number;
    priceMax?: number;
    page?: number;
    limit?: number;
    search?: string;
}

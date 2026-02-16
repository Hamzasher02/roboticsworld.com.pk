export interface CreateBundlePayload {
    bundleName: string;
    price: number;
    category: string;
    subcategory: string[];
    level: string[];
    ageGroup: string;
    access: number;
    description: string;
    discount: number;
    couponCode: string;
    visibility: 'Active' | 'Inactive';
    courses: string[];
    thumbnail?: File;
}

export interface CreateBundleResponse {
    success: boolean;
    message: string;
    data?: any;
}

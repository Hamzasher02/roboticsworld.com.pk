// cart interfaces
export interface CartItem {
    courseThumbnail: {
        publicId: string;
        secureUrl: string;
    };
    course: {
        courseThumbnail: {
            publicId: string;
            secureUrl: string;
        };
        _id: string;
        courseTitle: string;
        courseCategory: string[];
        courseSubCategory: string;
        courseAgeGroup: string;
        courseLevel: string;
    };
    purchaseType: 'Live Classes' | 'Recorded Lectures';
    quantity: number;
    price: number;
    courseTitle: string;
    _id: string;
    addedAt: string;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface AddToCartRequest {
    courseId: string;
    purchaseType: 'Live Classes' | 'Recorded Lectures';
    quantity: number;
}

export interface UpdateCartQuantityRequest {
    quantity: number;
}

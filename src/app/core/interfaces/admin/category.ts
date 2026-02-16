export interface CreateCategoryPayload {
  categoryName: string;
  description: string;
  subCategory: string[];
  categoryLevel: string[];
  categoryAgeGroup: string[];
  visibility: "active" | "inactive";
  profilePicture: File;
}

export interface UpdateCategoryPayload {
  categoryId: string;
  categoryName: string;
  description?: string;
  subCategory: string[];
  categoryLevel: string[];
  categoryAgeGroup: string[];
  visibility: "active" | "inactive";
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface ApiCategory {
  _id: string;
  categoryName: string;

  // backend kabhi description, kabhi categoryDescription bhej raha
  description?: string;
  categoryDescription?: string;

  visibility: 'active' | 'inactive';
  icon?: {
    publicId: string;
    secureUrl: string;
  };
  subCategory: string[];
  categoryLevel: string[];
  categoryAgeGroup: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategoryListResponse {
  success: boolean;
  message: string;
  data: ApiCategory[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Fixed interfaces to match backend response structure { success, message, data: [] }
export interface CategorySubGroupsResponse {
  success: boolean;
  message: string;
  data: string[];
}

export interface CategoryAgeGroupsResponse {
  success: boolean;
  message: string;
  data: string[];
}

export interface CategoryLevelsResponse {
  success: boolean;
  message: string;
  data: string[];
}

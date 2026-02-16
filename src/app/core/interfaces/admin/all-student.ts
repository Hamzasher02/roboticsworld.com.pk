export interface ApiFile {
  secureUrl: string;
  publicId: string;
}

export interface StudentNested {
  coursePreferences: string[];
}

/**
 * Backend response item structure for getAllStudents endpoint
 * Backend returns: { _id, firstName, lastName, email, profilePicture, courses }
 * Note: `courses` is an array of course TITLES (strings), not IDs
 */
export interface StudentApiItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: ApiFile;
  courses: string[]; // Array of course TITLES from backend (not IDs)
  accountStatus?: string;
  createdAt?: string;
}

/**
 * Backend response structure for getAllStudents endpoint
 * Note: data is wrapped in an extra array: data: [result] where result is StudentApiItem[]
 */
export interface GetAllStudentsResponse {
  success: boolean;
  message: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalStudents: number;
    limit: number;
  };
  data: StudentApiItem[][] | StudentApiItem[]; // Can be [[...students]] or [...students]
}

/** UI list item for component display */
export interface StudentListItem {
  profilePictureUrl: string | null;
  name: string;
  email: string;
  courses: string;
  accountStatus: string;
  id: string;
  subscription: string;
  enrollmentDate: string;
  expiryDate: string;
}

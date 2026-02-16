// instructor profile interfaces
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface InstructorProfileDto {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  phoneNumber?: string;

  qualification?: string;
  degreeTitle?: string;
  graduationYear?: number;

  totalMarks?: number;
  obtainedMarks?: number;

  institution?: string;
  transcript?: string;
}

export type GetInstructorProfileResponse = ApiResponse<InstructorProfileDto>;

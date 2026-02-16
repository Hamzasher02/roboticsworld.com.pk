export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Nested interfaces matching backend response structure
export interface AcademicInfo {
  qualification?: string;
  degreeTitle?: string;
  graduationYear?: number;
  totalMarks?: number;
  obtainedMarks?: number;
  institution?: string;
  transcript?: string;
  transcriptVerification?: string;
  newTranscriptRequest?: boolean;
  coursePreferences?: string[];
}

export interface EmergencyInfo {
  fullName?: string;
  relationship?: string;
  phoneNumber?: string;
}

export interface ResidenceInfo {
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
}

export interface InstructorProfileDto {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  phoneNumber?: string;
  role?: string;
  dateOfBirth?: string; // ✅ add this (matches backend)

  // Nested objects matching backend response
  academicInfo?: AcademicInfo;
  emergencyInfo?: EmergencyInfo;
  residenceInfo?: ResidenceInfo;

  // Legacy flat fields (kept for backward compatibility if needed)
  qualification?: string;
  degreeTitle?: string;
  graduationYear?: number;
  totalMarks?: number;
  obtainedMarks?: number;
  institution?: string;
  transcript?: string;
}

// Backend returns data as an array: data: [response]
export type GetInstructorProfileResponse = ApiResponse<InstructorProfileDto[]>;

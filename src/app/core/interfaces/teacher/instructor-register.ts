// instructor register interfaces
export type UserRole = 'student' | 'instructor';

export interface PublicCourseMin {
  _id: string;
  courseTitle: string;
}

export interface PublicCoursesMinResponse {
  success: boolean;
  message: string;
  data: PublicCourseMin[];
}

export interface InstructorRegisterPayload {
  // Personal
  firstName: string;
  lastName: string;
  fatherName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
  bio: string;

  // Meta
  role: UserRole;
  consentAccepted: boolean;

  // Residence
  country: string;
  address: string;
  city: string;
  postalCode: string;

  // Emergency
  fullName: string;
  relationship: string;
  emergencyPhoneNumber: string;

  // Academic
  qualification: string;
  degreeTitle: string;
  graduationYear: string;
  totalMarks: string;
  obtainedMarks: string;
  institution: string;

  // Teaching (IDs)
  coursePreferences: string[];
}

export interface InstructorRegisterResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

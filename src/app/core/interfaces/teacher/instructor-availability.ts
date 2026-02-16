// instructor availability interfaces
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type DayCode = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface AvailabilityInstructorRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface InstructorAvailabilitySlot {
  _id: string;
  instructorId: AvailabilityInstructorRef;
  sessionTitle: string;
  scheduleType: string;
  days: DayCode[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AvailabilitySummary {
  totalTimeSlots: number;
  totalWeeks: number;
  activeSlots: number;
}

export interface AvailabilityPagination {
  currentPage: number;
  totalPages: number;
  totalSlots: number;
  limit: number;
}

export interface GetMyAvailabilityResponse {
  success: boolean;
  message: string;
  data: InstructorAvailabilitySlot[];
  summary: AvailabilitySummary;
  pagination: AvailabilityPagination;
}

// src/app/features/teacher/models/session.model.ts
export interface Session {
  date: string;
  time: string;
  studentName: string;
  studentImage: string;
  sessionNumber: string; // e.g. "2 of 12"
  totalSessions: number;
  type: 'Live Session' | 'Demo Session';
  courseName: string;
  moduleName: string;
  meetingLink?: string;
}


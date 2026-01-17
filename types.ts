export interface Student {
  id: string;
  fullName: string;
  fatherName: string;
  admissionNo: string;
  formBNo: string;
  address: string;
  admissionClass: string;
  photoUrl: string; // Base64 string
  leaves: LeaveRecord[];
  attendance: AttendanceRecord[];
}

export interface Teacher {
  id: string;
  name: string;
  designation: string;
  subjects: string[];
  qualification: string;
  experience: string;
  isOnLeave: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface LeaveRecord {
  id: string;
  date: string;
  reason: string;
  approved: boolean;
}

export interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
}

export interface TimetableEntry {
  day: string;
  period: number;
  subject: string;
  teacherId: string;
  classId: string;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  STUDENTS = 'STUDENTS',
  TEACHERS = 'TEACHERS',
  SUBJECTS = 'SUBJECTS',
  ATTENDANCE = 'ATTENDANCE',
  TIMETABLE = 'TIMETABLE',
  REPORTS = 'REPORTS',
}

export interface SubstitutionSuggestion {
  period: number;
  day: string;
  absentTeacher: string;
  suggestedTeacher: string;
  reason: string;
}

// Replace this URL with the actual path to your logo image file
export const LOGO_URL = "https://placehold.co/150x150/1e3a8a/ffffff?text=WFGHSS"; 
export const SCHOOL_NAME = "Working Folks Grammar Higher Secondary School";
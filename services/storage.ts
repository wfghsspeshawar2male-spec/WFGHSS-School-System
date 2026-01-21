import { Student, Teacher, TimetableEntry, Subject, TimetableSettings } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'edunexus_students',
  TEACHERS: 'edunexus_teachers_v2',
  SUBJECTS: 'edunexus_subjects',
  TIMETABLE: 'edunexus_timetable',
  SETTINGS: 'edunexus_timetable_settings',
};

const DEFAULT_SETTINGS: TimetableSettings = {
  sessionName: 'Summer',
  startTime: '08:00',
  periodDuration: 35,
  breakDuration: 15,
  breakAfterPeriod: 5,
};

const INITIAL_TEACHERS: Teacher[] = [];

// Seed subjects if empty
const INITIAL_SUBJECTS: Subject[] = [
  { id: '1', name: 'Mathematics', code: 'MATH' },
  { id: '2', name: 'Physics', code: 'PHY' },
  { id: '3', name: 'Chemistry', code: 'CHEM' },
  { id: '4', name: 'Biology', code: 'BIO' },
  { id: '5', name: 'English', code: 'ENG' },
  { id: '6', name: 'Urdu', code: 'URD' },
  { id: '7', name: 'Islamiyat', code: 'ISL' },
  { id: '8', name: 'Computer Science', code: 'CS' },
  { id: '9', name: 'Pakistan Studies', code: 'PST' },
  { id: '10', name: 'General Science', code: 'GSC' },
];

export const db = {
  getStudents: (): Student[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : [];
  },
  
  saveStudent: (student: Student): void => {
    const students = db.getStudents();
    const existingIndex = students.findIndex(s => s.id === student.id);
    if (existingIndex >= 0) {
      students[existingIndex] = student;
    } else {
      students.push(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  deleteStudent: (id: string): void => {
    const students = db.getStudents();
    const newStudents = students.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(newStudents));
  },

  getTeachers: (): Teacher[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
      return INITIAL_TEACHERS;
    }
    return JSON.parse(data);
  },

  saveTeacher: (teacher: Teacher): void => {
    const teachers = db.getTeachers();
    const existingIndex = teachers.findIndex(t => t.id === teacher.id);
    if (existingIndex >= 0) {
      teachers[existingIndex] = teacher;
    } else {
      teachers.push(teacher);
    }
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  },

  deleteTeacher: (id: string): void => {
    const teachers = db.getTeachers();
    const newTeachers = teachers.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(newTeachers));
  },

  getSubjects: (): Subject[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
      return INITIAL_SUBJECTS;
    }
    return JSON.parse(data);
  },

  saveSubject: (subject: Subject): void => {
    const subjects = db.getSubjects();
    const existingIndex = subjects.findIndex(s => s.id === subject.id);
    if (existingIndex >= 0) {
      subjects[existingIndex] = subject;
    } else {
      subjects.push(subject);
    }
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  },

  deleteSubject: (id: string): void => {
    const subjects = db.getSubjects();
    const newSubjects = subjects.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(newSubjects));
  },

  getTimetable: (): TimetableEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
    return data ? JSON.parse(data) : [];
  },

  saveTimetable: (timetable: TimetableEntry[]): void => {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
  },

  getSettings: (): TimetableSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  saveSettings: (settings: TimetableSettings): void => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};
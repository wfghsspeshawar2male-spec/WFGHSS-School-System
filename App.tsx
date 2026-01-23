import React, { useState, useEffect } from 'react';
import { View, Student, Teacher, Subject, SubstitutionSuggestion, LOGO_URL, SCHOOL_NAME } from './types';
import { db } from './services/storage';
import { suggestSubstitutions } from './services/gemini';
import StudentForm from './components/StudentForm';
import TeacherForm from './components/TeacherForm';
import SubjectForm from './components/SubjectForm';
import TimetableView from './components/TimetableView';
import ReportsView from './components/ReportsView';

// --- Icons ---
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>;
const HomeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const TeacherIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ReportIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const BookIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const PrintIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [printStudent, setPrintStudent] = useState<Partial<Student> | null>(null);
  const [printTeacher, setPrintTeacher] = useState<Partial<Teacher> | null>(null);
  const [printSubject, setPrintSubject] = useState<Partial<Subject> | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  // Professional print trigger: wait for state to render then call window.print
  useEffect(() => {
    if (printStudent || printTeacher || printSubject) {
      document.body.classList.add('printing-individual');
      const timer = setTimeout(() => {
        window.print();
        document.body.classList.remove('printing-individual');
        setPrintStudent(null);
        setPrintTeacher(null);
        setPrintSubject(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printStudent, printTeacher, printSubject]);

  const refreshData = () => {
    setStudents(db.getStudents());
    setTeachers(db.getTeachers());
    setSubjects(db.getSubjects());
  };

  const handleDeleteStudent = (id: string) => {
    if (!id) return;
    if (window.confirm('Delete student record permanently?')) {
      db.deleteStudent(id);
      refreshData();
      setShowStudentForm(false);
      setEditingStudent(null);
    }
  };

  const handleDeleteTeacher = (id: string) => {
    if (!id) return;
    if (window.confirm('Delete faculty record? This affects timetable.')) {
      db.deleteTeacher(id);
      refreshData();
      setShowTeacherForm(false);
      setEditingTeacher(null);
    }
  };

  const handleDeleteSubject = (id: string) => {
    if (!id) return;
    if (window.confirm('Delete this subject?')) {
      db.deleteSubject(id);
      refreshData();
      setShowSubjectForm(false);
      setEditingSubject(null);
    }
  };

  const SidebarItem = ({ view, icon, label }: { view: View; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => { 
          setCurrentView(view); 
          setShowStudentForm(false); 
          setShowTeacherForm(false);
          setShowSubjectForm(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        currentView === view ? 'bg-blue-800 text-white shadow-md' : 'text-blue-100 hover:bg-blue-800/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="flex flex-1 overflow-hidden no-print-on-individual">
        {/* Sidebar */}
        <div className="w-64 bg-[#1e3a8a] text-white shadow-2xl flex flex-col print:hidden">
          <div className="p-6 border-b border-blue-800 flex flex-col items-center text-center">
            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 mb-3 object-contain" />
            <h1 className="text-lg font-bold leading-tight">WFGHSS</h1>
            <p className="text-xs text-blue-200 mt-1">Peshawar-2 (Boys)</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <SidebarItem view={View.DASHBOARD} icon={<HomeIcon />} label="Dashboard" />
            <SidebarItem view={View.STUDENTS} icon={<UserIcon />} label="Students" />
            <SidebarItem view={View.TEACHERS} icon={<TeacherIcon />} label="Teachers" />
            <SidebarItem view={View.SUBJECTS} icon={<BookIcon />} label="Subjects" />
            <SidebarItem view={View.TIMETABLE} icon={<CalendarIcon />} label="Timetable" />
            <SidebarItem view={View.REPORTS} icon={<ReportIcon />} label="Reports" />
          </nav>
        </div>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <header className="bg-white shadow-sm p-6 sticky top-0 z-10 print:hidden border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
              {currentView.replace('_', ' ')}
            </h2>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium">
              <PrintIcon /> Print Screen
            </button>
          </header>

          <div className="p-6">
            {currentView === View.DASHBOARD && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-800"><p className="text-gray-500 text-sm">Total Students</p><p className="text-3xl font-bold">{students.length}</p></div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-600"><p className="text-gray-500 text-sm">Total Teachers</p><p className="text-3xl font-bold">{teachers.length}</p></div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-purple-600"><p className="text-gray-500 text-sm">Total Subjects</p><p className="text-3xl font-bold">{subjects.length}</p></div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-red-600"><p className="text-gray-500 text-sm">Absent Staff</p><p className="text-3xl font-bold">{teachers.filter(t=>t.isOnLeave).length}</p></div>
              </div>
            )}

            {currentView === View.STUDENTS && (
              showStudentForm ? (
                <StudentForm 
                  initialData={editingStudent} 
                  onSuccess={() => { setShowStudentForm(false); setEditingStudent(null); refreshData(); }} 
                  onCancel={() => { setShowStudentForm(false); setEditingStudent(null); }}
                  onDelete={handleDeleteStudent}
                  onPrint={setPrintStudent}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end"><button onClick={() => setShowStudentForm(true)} className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900">+ New Admission</button></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map(s => (
                      <div key={s.id} className="bg-white p-4 rounded-lg shadow-sm border flex gap-4 relative group">
                        <img src={s.photoUrl || "https://placehold.co/100x100"} className="w-16 h-16 rounded-full object-cover" />
                        <div><h3 className="font-bold">{s.fullName}</h3><p className="text-xs text-gray-500">ID: {s.admissionNo}</p><p className="text-xs">Class: {s.admissionClass}</p></div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
                          <button onClick={() => setPrintStudent(s)} className="p-1 text-gray-400 hover:text-blue-600"><PrintIcon /></button>
                          <button onClick={() => { setEditingStudent(s); setShowStudentForm(true); }} className="p-1 text-gray-400 hover:text-blue-800"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                          <button onClick={() => handleDeleteStudent(s.id)} className="p-1 text-gray-400 hover:text-red-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {currentView === View.TEACHERS && (
              showTeacherForm ? (
                <TeacherForm 
                  initialData={editingTeacher}
                  onSuccess={() => { setShowTeacherForm(false); setEditingTeacher(null); refreshData(); }}
                  onCancel={() => { setShowTeacherForm(false); setEditingTeacher(null); }}
                  onDelete={handleDeleteTeacher}
                  onPrint={setPrintTeacher}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold">Staff Directory</h3>
                    <button onClick={() => setShowTeacherForm(true)} className="bg-blue-800 text-white px-3 py-1.5 text-sm rounded">+ Add Staff</button>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="p-4 text-left">Name</th><th className="p-4 text-left">Role</th><th className="p-4 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y">
                      {teachers.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="p-4"><div className="font-bold">{t.name}</div><div className="text-xs text-gray-500">{t.qualification}</div></td>
                          <td className="p-4 text-sm">{t.designation}</td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => setPrintTeacher(t)} className="text-gray-400 hover:text-blue-600"><PrintIcon /></button>
                            <button onClick={() => { setEditingTeacher(t); setShowTeacherForm(true); }} className="text-blue-600">Edit</button>
                            <button onClick={() => handleDeleteTeacher(t.id)} className="text-red-600">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {currentView === View.SUBJECTS && (
              showSubjectForm ? (
                <SubjectForm 
                  initialData={editingSubject}
                  onSuccess={() => { setShowSubjectForm(false); setEditingSubject(null); refreshData(); }}
                  onCancel={() => { setShowSubjectForm(false); setEditingSubject(null); }}
                  onDelete={handleDeleteSubject}
                  onPrint={setPrintSubject}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden max-w-2xl">
                   <div className="p-4 bg-gray-50 border-b flex justify-between items-center"><h3 className="font-bold">Subjects</h3><button onClick={() => setShowSubjectForm(true)} className="bg-blue-800 text-white px-3 py-1.5 text-sm rounded">Add New</button></div>
                   <table className="w-full">
                    <tbody className="divide-y">
                      {subjects.map(s => (
                        <tr key={s.id}>
                          <td className="p-4 font-bold">{s.name}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => { setEditingSubject(s); setShowSubjectForm(true); }} className="text-blue-600 mr-4">Edit</button>
                            <button onClick={() => handleDeleteSubject(s.id)} className="text-red-600">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                   </table>
                </div>
              )
            )}

            {currentView === View.TIMETABLE && <TimetableView />}
            {currentView === View.REPORTS && <ReportsView />}
          </div>
        </main>
      </div>

      {/* --- HIDDEN PRINT PREVIEW TEMPLATES --- */}
      {printStudent && (
        <div className="print-only-individual bg-white">
          <div className="p-10 border-4 border-double border-gray-800">
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-10">
              <img src={LOGO_URL} alt="Logo" className="h-20" />
              <div className="text-center flex-1">
                <h1 className="text-2xl font-black text-blue-900 uppercase">{SCHOOL_NAME}</h1>
                <p className="font-bold text-gray-700">STUDENT ADMISSION DOSSIER</p>
                <p className="text-xs text-gray-500 italic mt-1">Reg Ref: {printStudent.admissionNo || '________________'}</p>
              </div>
              <div className="w-24 h-24 border-2 border-gray-300 flex items-center justify-center text-[8px] text-gray-400 uppercase">
                {printStudent.photoUrl ? <img src={printStudent.photoUrl} className="w-full h-full object-cover" /> : 'Passport Photo'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10 text-lg mb-10">
              <div className="space-y-6">
                <p><strong>Student:</strong> <span className="underline ml-2">{printStudent.fullName || '__________________________'}</span></p>
                <p><strong>Father:</strong> <span className="underline ml-2">{printStudent.fatherName || '__________________________'}</span></p>
                <p><strong>Adm #:</strong> <span className="underline ml-2">{printStudent.admissionNo || '__________________________'}</span></p>
              </div>
              <div className="space-y-6">
                <p><strong>Class:</strong> <span className="underline ml-2">{printStudent.admissionClass || '__________________________'}</span></p>
                <p><strong>ID/B-Form:</strong> <span className="underline ml-2">{printStudent.formBNo || '__________________________'}</span></p>
                <p><strong>Date:</strong> <span className="underline ml-2">{new Date().toLocaleDateString()}</span></p>
              </div>
            </div>
            <div className="mb-20">
              <p><strong>Address:</strong></p>
              <div className="mt-2 p-4 bg-gray-50 border rounded min-h-[100px] border-gray-300">{printStudent.address || '________________________________________________________________________________________________________________________________'}</div>
            </div>
            <div className="flex justify-between px-10">
              <div className="text-center w-48 border-t-2 border-gray-800 pt-1 text-sm font-bold">Principal Signature</div>
              <div className="text-center w-48 border-t-2 border-gray-800 pt-1 text-sm font-bold">Parent/Guardian</div>
            </div>
          </div>
        </div>
      )}

      {printTeacher && (
        <div className="print-only-individual bg-white">
          <div className="p-10 border-4 border-double border-gray-800">
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-10">
              <img src={LOGO_URL} alt="Logo" className="h-20" />
              <div className="text-center flex-1">
                <h1 className="text-2xl font-black text-blue-900 uppercase">{SCHOOL_NAME}</h1>
                <p className="font-bold text-gray-700">FACULTY PROFILE & EMPLOYMENT RECORD</p>
              </div>
              <div className="w-24 h-24 border-2 border-gray-300 flex items-center justify-center text-[8px] text-gray-400">STAFF PHOTO</div>
            </div>
            <div className="grid grid-cols-2 gap-10 text-lg mb-20">
              <div className="space-y-6">
                <p><strong>Name:</strong> <span className="underline ml-2">{printTeacher.name || '__________________________'}</span></p>
                <p><strong>Designation:</strong> <span className="underline ml-2">{printTeacher.designation || '__________________________'}</span></p>
                <p><strong>Qualification:</strong> <span className="underline ml-2">{printTeacher.qualification || '__________________________'}</span></p>
              </div>
              <div className="space-y-6">
                <p><strong>Exp:</strong> <span className="underline ml-2">{printTeacher.experience || '__________________________'}</span></p>
                <p><strong>Subjects:</strong> <span className="underline ml-2 italic">{printTeacher.subjects?.join(', ') || '__________________________'}</span></p>
                <p><strong>Issued:</strong> <span className="underline ml-2">{new Date().toLocaleDateString()}</span></p>
              </div>
            </div>
            <div className="flex justify-around">
              <div className="text-center w-48 border-t-2 border-gray-800 pt-1 text-sm font-bold">Admin Officer</div>
              <div className="text-center w-48 border-t-2 border-gray-800 pt-1 text-sm font-bold">Principal Signature</div>
            </div>
          </div>
        </div>
      )}

      {printSubject && (
        <div className="print-only-individual bg-white">
          <div className="p-10 border-4 border-double border-gray-800 text-center">
            <img src={LOGO_URL} alt="Logo" className="h-20 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-blue-900 uppercase mb-2">{SCHOOL_NAME}</h1>
            <h2 className="text-xl font-bold border-y-2 border-gray-800 py-2 mb-10">SUBJECT CURRICULUM ENTRY</h2>
            <div className="max-w-md mx-auto space-y-8 text-2xl text-left">
              <p><strong>Subject Name:</strong> <span className="underline ml-4">{printSubject.name || '____________________'}</span></p>
              <p><strong>Subject Code:</strong> <span className="underline ml-4">{printSubject.code || '____________________'}</span></p>
            </div>
            <div className="mt-32 text-gray-400 text-sm italic">System Generated Academic Record - {new Date().getFullYear()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
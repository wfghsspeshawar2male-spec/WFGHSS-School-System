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
  
  // Forms States
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [suggestions, setSuggestions] = useState<SubstitutionSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Individual record printing state
  const [printStudent, setPrintStudent] = useState<Student | null>(null);
  const [printTeacher, setPrintTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setStudents(db.getStudents());
    setTeachers(db.getTeachers());
    setSubjects(db.getSubjects());
  };

  const handlePrintIndividualStudent = (student: Student) => {
    setPrintStudent(student);
    document.body.classList.add('printing-individual');
    // Using a slightly longer timeout to ensure DOM is ready for print
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-individual');
      setPrintStudent(null);
    }, 250);
  };

  const handlePrintIndividualTeacher = (teacher: Teacher) => {
    setPrintTeacher(teacher);
    document.body.classList.add('printing-individual');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-individual');
      setPrintTeacher(null);
    }, 250);
  };

  const handlePrintPage = () => {
    window.print();
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student record? This action cannot be undone.')) {
        db.deleteStudent(id);
        refreshData();
        setShowStudentForm(false);
        setEditingStudent(null);
    }
  };

  const handleDeleteTeacher = (id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher? This will also affect the timetable.')) {
        db.deleteTeacher(id);
        refreshData();
        setShowTeacherForm(false);
        setEditingTeacher(null);
    }
  };

  const handleDeleteSubject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
        db.deleteSubject(id);
        refreshData();
        setShowSubjectForm(false);
        setEditingSubject(null);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowStudentForm(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowTeacherForm(true);
  };

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setShowTeacherForm(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setShowSubjectForm(true);
  };

  const handleAddSubject = () => {
    setEditingSubject(null);
    setShowSubjectForm(true);
  };

  const handleTeacherLeaveToggle = async (teacher: Teacher) => {
    const updatedTeacher = { ...teacher, isOnLeave: !teacher.isOnLeave };
    db.saveTeacher(updatedTeacher);
    
    if (updatedTeacher.isOnLeave) {
      setLoadingSuggestions(true);
      const timetable = db.getTimetable();
      const allTeachers = db.getTeachers(); 
      const newSuggestions = await suggestSubstitutions(updatedTeacher, timetable, allTeachers);
      setSuggestions(newSuggestions);
      setLoadingSuggestions(false);
    } else {
      setSuggestions([]);
    }
    refreshData();
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
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans no-print-on-individual">
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
        <div className="p-4 border-t border-blue-800 text-center text-xs text-blue-300">
          EduNexus v1.1.0
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-6 sticky top-0 z-10 print:hidden border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            {currentView === View.DASHBOARD && 'Dashboard Overview'}
            {currentView === View.STUDENTS && 'Student Management'}
            {currentView === View.TEACHERS && 'Faculty Management'}
            {currentView === View.SUBJECTS && 'Subject Database'}
            {currentView === View.TIMETABLE && 'Class Scheduling'}
            {currentView === View.REPORTS && 'System Reports'}
          </h2>
          <button 
            onClick={handlePrintPage}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
            title="Print this page"
          >
            <PrintIcon />
            Print Page
          </button>
        </header>

        <div className="p-6">
          {/* Dashboard View */}
          {currentView === View.DASHBOARD && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-800">
                <p className="text-gray-500 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{students.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-600">
                <p className="text-gray-500 text-sm font-medium">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{teachers.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-purple-600">
                <p className="text-gray-500 text-sm font-medium">Total Subjects</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{subjects.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-red-600">
                <p className="text-gray-500 text-sm font-medium">Teachers on Leave</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{teachers.filter(t => t.isOnLeave).length}</p>
              </div>

              {/* Suggestions Panel */}
              {suggestions.length > 0 && (
                 <div className="col-span-1 md:col-span-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                   <h3 className="font-semibold text-yellow-800 mb-2">⚠ Substitution Suggestions (AI)</h3>
                   <div className="grid gap-2">
                     {suggestions.map((s, idx) => (
                       <div key={idx} className="bg-white p-3 rounded shadow-sm text-sm">
                         <span className="font-bold">{s.day} Period {s.period}:</span> {s.absentTeacher} is absent. 
                         <span className="text-green-600 font-bold mx-2">→</span> 
                         Assign <span className="font-bold">{s.suggestedTeacher}</span>.
                         <span className="text-gray-500 ml-2 italic">({s.reason})</span>
                       </div>
                     ))}
                   </div>
                 </div>
              )}
            </div>
          )}

          {/* Students View */}
          {currentView === View.STUDENTS && (
            <div>
              {!showStudentForm ? (
                <div>
                   <div className="flex justify-between mb-4">
                     <p className="text-gray-600">Manage student records and admissions.</p>
                     <button onClick={handleAddStudent} className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900 shadow-sm transition-colors">
                       + New Admission
                     </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {students.map(student => (
                       <div key={student.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex gap-4 relative group hover:shadow-md transition-shadow">
                         <img 
                           src={student.photoUrl || "https://picsum.photos/100/100"} 
                           alt={student.fullName} 
                           className="w-16 h-16 rounded-full object-cover bg-gray-200 border-2 border-blue-100"
                         />
                         <div className="flex-1">
                           <h3 className="font-semibold text-gray-900">{student.fullName}</h3>
                           <p className="text-xs text-gray-500">ID: {student.admissionNo}</p>
                           <p className="text-xs text-gray-500">Class: {student.admissionClass}</p>
                           <p className="text-xs text-gray-500">Father: {student.fatherName}</p>
                         </div>
                         <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handlePrintIndividualStudent(student)}
                                className="text-gray-400 hover:text-blue-600 p-1"
                                title="Print Student Profile"
                            >
                                <PrintIcon />
                            </button>
                            <button 
                                onClick={() => handleEditStudent(student)}
                                className="text-gray-400 hover:text-blue-800 p-1"
                                title="Edit Student"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button 
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-gray-300 hover:text-red-600 p-1"
                                title="Delete Student"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                         </div>
                       </div>
                     ))}
                     {students.length === 0 && <p className="text-gray-500 italic">No students registered yet.</p>}
                   </div>
                </div>
              ) : (
                <StudentForm 
                  initialData={editingStudent}
                  onSuccess={() => { setShowStudentForm(false); setEditingStudent(null); refreshData(); }} 
                  onCancel={() => { setShowStudentForm(false); setEditingStudent(null); }}
                  onDelete={handleDeleteStudent}
                  onPrint={handlePrintIndividualStudent}
                />
              )}
            </div>
          )}

          {/* Teachers View */}
          {currentView === View.TEACHERS && (
            <div>
            {!showTeacherForm ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                 <div className="flex flex-col">
                    <h3 className="font-semibold text-gray-700">Faculty Members</h3>
                    {loadingSuggestions && <span className="text-xs text-blue-600 animate-pulse">Generating substitution plan...</span>}
                 </div>
                 <button onClick={handleAddTeacher} className="bg-blue-800 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-900 transition-colors">
                    + Add Teacher
                 </button>
               </div>
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {teachers.map(teacher => (
                     <tr key={teacher.id} className="hover:bg-gray-50 group">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                         <div className="text-sm text-gray-500">{teacher.qualification}</div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.designation}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.subjects.join(', ')}</td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                           teacher.isOnLeave ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                         }`}>
                           {teacher.isOnLeave ? 'On Leave' : 'Active'}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                         <button 
                           onClick={() => handlePrintIndividualTeacher(teacher)}
                           className="text-gray-400 hover:text-blue-600"
                           title="Print Faculty Profile"
                         >
                           <PrintIcon />
                         </button>
                         <button 
                           onClick={() => handleTeacherLeaveToggle(teacher)}
                           className={`text-blue-600 hover:text-blue-900 ${loadingSuggestions ? 'opacity-50 cursor-not-allowed' : ''}`}
                           disabled={loadingSuggestions}
                         >
                           {teacher.isOnLeave ? 'Mark Active' : 'Mark Leave'}
                         </button>
                         <button 
                           onClick={() => handleEditTeacher(teacher)}
                           className="text-blue-600 hover:text-blue-900"
                         >
                           Edit
                         </button>
                         <button 
                           onClick={() => handleDeleteTeacher(teacher.id)}
                           className="text-red-600 hover:text-red-900"
                         >
                           Delete
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
             ) : (
                <TeacherForm 
                    initialData={editingTeacher} 
                    onSuccess={() => { setShowTeacherForm(false); setEditingTeacher(null); refreshData(); }} 
                    onCancel={() => { setShowTeacherForm(false); setEditingTeacher(null); }}
                    onDelete={handleDeleteTeacher}
                    onPrint={handlePrintIndividualTeacher}
                />
             )}
            </div>
          )}

          {/* Subjects View */}
          {currentView === View.SUBJECTS && (
             <div>
               {!showSubjectForm ? (
                 <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                      <div>
                        <h3 className="font-semibold text-gray-700">Subjects</h3>
                        <p className="text-xs text-gray-500">Manage list of school subjects.</p>
                      </div>
                      <button onClick={handleAddSubject} className="bg-blue-800 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-900 transition-colors">
                        + Add Subject
                      </button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subjects.map(subject => (
                          <tr key={subject.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.code || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                              <button 
                                onClick={() => handleEditSubject(subject)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteSubject(subject.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               ) : (
                  <SubjectForm 
                    initialData={editingSubject}
                    onSuccess={() => { setShowSubjectForm(false); setEditingSubject(null); refreshData(); }}
                    onCancel={() => { setShowSubjectForm(false); setEditingSubject(null); }}
                  />
               )}
             </div>
          )}

          {/* Timetable View */}
          {currentView === View.TIMETABLE && (
            <TimetableView />
          )}

          {/* Reports View */}
          {currentView === View.REPORTS && (
            <ReportsView />
          )}
        </div>
      </main>

      {/* Hidden Print-Only Components for Individual Records */}
      {printStudent && (
        <div className="print-only-individual">
            <div className="p-10 border-4 border-double border-gray-800 bg-white">
                <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                    <img src={LOGO_URL} alt="Logo" className="h-24 w-auto" />
                    <div className="text-center flex-1">
                        <h1 className="text-3xl font-black uppercase text-blue-900">{SCHOOL_NAME}</h1>
                        <p className="text-xl font-bold text-gray-700">STUDENT ADMISSION PROFILE</p>
                        <p className="text-sm text-gray-500 italic mt-1">Ref: {printStudent.admissionNo}</p>
                    </div>
                    <div className="w-24 h-24 border-2 border-gray-300 rounded flex items-center justify-center text-[10px] text-gray-400 overflow-hidden">
                        {printStudent.photoUrl ? (
                            <img src={printStudent.photoUrl} className="w-full h-full object-cover" />
                        ) : 'OFFICE PHOTO'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-lg">
                    <div className="space-y-4">
                        <p><strong>Full Name:</strong> <span className="underline">{printStudent.fullName}</span></p>
                        <p><strong>Father's Name:</strong> <span className="underline">{printStudent.fatherName}</span></p>
                        <p><strong>Admission No:</strong> <span className="underline">{printStudent.admissionNo}</span></p>
                        <p><strong>Form B / CNIC:</strong> <span className="underline">{printStudent.formBNo || 'N/A'}</span></p>
                    </div>
                    <div className="space-y-4">
                        <p><strong>Class:</strong> <span className="underline">Grade {printStudent.admissionClass}</span></p>
                        <p><strong>Date of Issue:</strong> <span className="underline">{new Date().toLocaleDateString()}</span></p>
                        <p><strong>School Branch:</strong> <span className="underline">Peshawar-2 (Boys)</span></p>
                    </div>
                </div>

                <div className="mt-8">
                    <p><strong>Residential Address:</strong></p>
                    <p className="mt-2 p-4 bg-gray-50 border rounded min-h-[100px]">{printStudent.address}</p>
                </div>

                <div className="mt-20 flex justify-between items-end">
                    <div className="text-center w-48 border-t-2 border-gray-800 pt-2">
                        <p className="text-sm font-bold">Principal Signature</p>
                    </div>
                    <div className="text-center w-48 border-t-2 border-gray-800 pt-2">
                        <p className="text-sm font-bold">Parent Signature</p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {printTeacher && (
        <div className="print-only-individual">
            <div className="p-10 border-4 border-double border-gray-800 bg-white">
                <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                    <img src={LOGO_URL} alt="Logo" className="h-24 w-auto" />
                    <div className="text-center flex-1">
                        <h1 className="text-3xl font-black uppercase text-blue-900">{SCHOOL_NAME}</h1>
                        <p className="text-xl font-bold text-gray-700">FACULTY EMPLOYMENT RECORD</p>
                        <p className="text-sm text-gray-500 italic mt-1">Staff ID: {printTeacher.id.substring(0,8).toUpperCase()}</p>
                    </div>
                    <div className="w-24 h-24 border-2 border-gray-300 flex items-center justify-center text-xs text-gray-400">STAFF PHOTO</div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-lg">
                    <div className="space-y-4">
                        <p><strong>Faculty Name:</strong> <span className="underline">{printTeacher.name}</span></p>
                        <p><strong>Designation:</strong> <span className="underline">{printTeacher.designation}</span></p>
                        <p><strong>Qualification:</strong> <span className="underline">{printTeacher.qualification}</span></p>
                    </div>
                    <div className="space-y-4">
                        <p><strong>Experience:</strong> <span className="underline">{printTeacher.experience}</span></p>
                        <p><strong>Assigned Subjects:</strong> <span className="underline italic">{printTeacher.subjects.join(', ')}</span></p>
                        <p><strong>Branch:</strong> <span className="underline">Peshawar-2 (Boys)</span></p>
                    </div>
                </div>

                <div className="mt-12 p-6 bg-blue-50 border-2 border-blue-200 rounded">
                    <h3 className="font-bold text-blue-900 mb-2">Internal Notes:</h3>
                    <p className="text-sm">This staff member is currently <strong>{printTeacher.isOnLeave ? 'ON LEAVE' : 'ACTIVE'}</strong> in the system. All academic responsibilities are managed via the EduNexus portal.</p>
                </div>

                <div className="mt-20 flex justify-between items-end">
                    <div className="text-center w-48 border-t-2 border-gray-800 pt-2">
                        <p className="text-sm font-bold">Administrative Officer</p>
                    </div>
                    <div className="text-center w-48 border-t-2 border-gray-800 pt-2">
                        <p className="text-sm font-bold">Principal Signature</p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
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
const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Students: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Teachers: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Timetable: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Reports: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Print: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [activeForm, setActiveForm] = useState<{ type: 'STUDENT' | 'TEACHER' | 'SUBJECT' | null, data: any }>({ type: null, data: null });
  const [printQueue, setPrintQueue] = useState<{ type: 'STUDENT' | 'TEACHER' | 'SUBJECT' | 'REPORT' | null, data: any }>({ type: null, data: null });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setStudents(db.getStudents());
    setTeachers(db.getTeachers());
    setSubjects(db.getSubjects());
  };

  const handleDelete = (type: 'STUDENT' | 'TEACHER' | 'SUBJECT', id: string) => {
    if (!id) return;
    const confirmMsg = `Are you sure you want to delete this ${type.toLowerCase()}? This action cannot be undone.`;
    if (window.confirm(confirmMsg)) {
      if (type === 'STUDENT') db.deleteStudent(id);
      if (type === 'TEACHER') db.deleteTeacher(id);
      if (type === 'SUBJECT') db.deleteSubject(id);
      
      refreshData();
      setActiveForm({ type: null, data: null });
    }
  };

  const handlePrintAction = () => {
    window.print();
  };

  const SidebarItem = ({ view, icon: Icon, label }: { view: View; icon: React.FC; label: string }) => (
    <button
      onClick={() => { setCurrentView(view); setActiveForm({ type: null, data: null }); }}
      className={`flex items-center space-x-3 w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
      }`}
    >
      <Icon />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Hidden on Print */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col no-print">
        <div className="p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
            <img src={LOGO_URL} alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-sm font-extrabold text-slate-800 text-center leading-tight tracking-tight">WFGHSS PORTAL</h1>
          <p className="text-[10px] font-bold text-blue-600 uppercase mt-1 tracking-widest">Administrator</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem view={View.DASHBOARD} icon={Icons.Dashboard} label="Overview" />
          <SidebarItem view={View.STUDENTS} icon={Icons.Students} label="Students" />
          <SidebarItem view={View.TEACHERS} icon={Icons.Teachers} label="Faculty" />
          <SidebarItem view={View.TIMETABLE} icon={Icons.Timetable} label="Schedule" />
          <SidebarItem view={View.REPORTS} icon={Icons.Reports} label="Records" />
        </nav>
        
        <div className="p-6 text-center">
          <p className="text-[10px] text-slate-400 font-medium">v1.2.6 AI Management</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 no-print">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">{currentView.replace('_', ' ')}</h2>
          <div className="flex gap-4">
             <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all">
                <Icons.Print /> PRINT PAGE
             </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {currentView === View.DASHBOARD && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Students</p><p className="text-4xl font-black text-slate-800">{students.length}</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><p className="text-slate-500 text-xs font-bold uppercase mb-1">Staff Count</p><p className="text-4xl font-black text-slate-800">{teachers.length}</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><p className="text-slate-500 text-xs font-bold uppercase mb-1">Subjects</p><p className="text-4xl font-black text-slate-800">{subjects.length}</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><p className="text-slate-500 text-xs font-bold uppercase mb-1">Absent Staff</p><p className="text-4xl font-black text-red-500">{teachers.filter(t=>t.isOnLeave).length}</p></div>
            </div>
          )}

          {currentView === View.STUDENTS && (
            activeForm.type === 'STUDENT' ? (
              <StudentForm 
                initialData={activeForm.data} 
                onSuccess={() => { setActiveForm({ type: null, data: null }); refreshData(); }} 
                onCancel={() => setActiveForm({ type: null, data: null })}
                onDelete={(id) => handleDelete('STUDENT', id)}
                onPrint={(data) => setPrintQueue({ type: 'STUDENT', data })}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 text-sm">Review and manage student profiles.</p>
                  <button onClick={() => setActiveForm({ type: 'STUDENT', data: null })} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all">+ NEW STUDENT</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map(s => (
                    <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 relative group hover:shadow-xl hover:border-blue-100 transition-all">
                      <img src={s.photoUrl || "https://placehold.co/100x100"} className="w-20 h-20 rounded-2xl object-cover bg-slate-50 border border-slate-100 shadow-inner" />
                      <div className="flex-1">
                        <h3 className="font-extrabold text-slate-800 leading-tight">{s.fullName}</h3>
                        <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase">ID: {s.admissionNo}</p>
                        <p className="text-xs text-slate-400 mt-1">Class: {s.admissionClass}</p>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setPrintQueue({ type: 'STUDENT', data: s })} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Icons.Print /></button>
                        <button onClick={() => setActiveForm({ type: 'STUDENT', data: s })} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      </div>
                    </div>
                  ))}
                  {students.length === 0 && <div className="col-span-full py-20 text-center"><p className="text-slate-400 font-medium italic">No students found. Add your first record.</p></div>}
                </div>
              </div>
            )
          )}

          {currentView === View.TEACHERS && (
             activeForm.type === 'TEACHER' ? (
                <TeacherForm 
                  initialData={activeForm.data} 
                  onSuccess={() => { setActiveForm({ type: null, data: null }); refreshData(); }} 
                  onCancel={() => setActiveForm({ type: null, data: null })}
                  onDelete={(id) => handleDelete('TEACHER', id)}
                  onPrint={(data) => setPrintQueue({ type: 'TEACHER', data })}
                />
             ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Faculty Directory</h3>
                    <button onClick={() => setActiveForm({ type: 'TEACHER', data: null })} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold">+ ADD STAFF</button>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b">
                      <tr><th className="p-6">Instructor</th><th className="p-6">Designation</th><th className="p-6 text-center">Status</th><th className="p-6 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teachers.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-6"><div className="font-bold text-slate-800">{t.name}</div><div className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{t.qualification}</div></td>
                          <td className="p-6 text-sm font-medium text-slate-600">{t.designation}</td>
                          <td className="p-6 text-center"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${t.isOnLeave ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>{t.isOnLeave ? 'ABSENT' : 'ACTIVE'}</span></td>
                          <td className="p-6 text-right space-x-2">
                             <button onClick={() => setPrintQueue({ type: 'TEACHER', data: t })} className="text-slate-300 hover:text-blue-600 transition-colors"><Icons.Print /></button>
                             <button onClick={() => setActiveForm({ type: 'TEACHER', data: t })} className="text-blue-600 font-bold text-sm hover:underline">EDIT</button>
                             <button onClick={() => handleDelete('TEACHER', t.id)} className="text-red-500 font-bold text-sm hover:underline ml-4">DELETE</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             )
          )}

          {currentView === View.SUBJECTS && (
             activeForm.type === 'SUBJECT' ? (
                <SubjectForm 
                   initialData={activeForm.data}
                   onSuccess={() => { setActiveForm({ type: null, data: null }); refreshData(); }}
                   onCancel={() => setActiveForm({ type: null, data: null })}
                   onDelete={(id) => handleDelete('SUBJECT', id)}
                   onPrint={(data) => setPrintQueue({ type: 'SUBJECT', data })}
                />
             ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl">
                   <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center"><h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Subjects</h3><button onClick={() => setActiveForm({ type: 'SUBJECT', data: null })} className="bg-blue-600 text-white px-3 py-1.5 text-xs font-bold rounded-lg">+ ADD NEW</button></div>
                   <table className="w-full text-left">
                     <tbody className="divide-y divide-slate-100">
                        {subjects.map(s => (
                           <tr key={s.id}>
                              <td className="p-6 font-bold text-slate-700">{s.name} <span className="text-[10px] font-mono text-slate-400 ml-2">[{s.code || 'NO-CODE'}]</span></td>
                              <td className="p-6 text-right space-x-4">
                                 <button onClick={() => setPrintQueue({ type: 'SUBJECT', data: s })} className="text-slate-300 hover:text-blue-600 transition-colors"><Icons.Print /></button>
                                 <button onClick={() => setActiveForm({ type: 'SUBJECT', data: s })} className="text-blue-600 font-bold text-sm">EDIT</button>
                                 <button onClick={() => handleDelete('SUBJECT', s.id)} className="text-red-500 font-bold text-sm">DELETE</button>
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

      {/* --- PRINT PREVIEW MODAL --- */}
      {printQueue.type && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm overflow-y-auto print-ui-only flex flex-col items-center py-10">
          <div className="flex justify-between items-center w-[210mm] max-w-full px-4 mb-6 sticky top-0 z-[110] bg-white/10 p-4 rounded-2xl backdrop-blur-lg border border-white/20 shadow-2xl">
            <h3 className="text-white font-bold flex items-center gap-2">
               <Icons.Print /> 
               <span>Print Preview - Verify details before printing</span>
            </h3>
            <div className="flex gap-4">
              <button onClick={() => setPrintQueue({ type: null, data: null })} className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all border border-white/10">
                <Icons.Close /> DISCARD
              </button>
              <button onClick={handlePrintAction} className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-500/20">
                <Icons.Print /> PRINT NOW
              </button>
            </div>
          </div>

          <div className="print-preview-content a4-page animate-in zoom-in-95 duration-300">
            {/* Student Template */}
            {printQueue.type === 'STUDENT' && (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start border-b-4 border-slate-800 pb-8 mb-12">
                  <img src={LOGO_URL} alt="Logo" className="h-24" />
                  <div className="text-center flex-1 px-8">
                    <h1 className="text-3xl font-black text-blue-900 uppercase leading-none">{SCHOOL_NAME}</h1>
                    <p className="text-base font-bold text-slate-700 mt-2 uppercase tracking-widest">Enrollment & Admission Office</p>
                    <p className="text-lg font-bold mt-4 underline underline-offset-8 decoration-2 uppercase">Official Student Dossier</p>
                  </div>
                  <div className="w-28 h-28 border-2 border-slate-300 flex items-center justify-center text-[10px] text-slate-300 uppercase font-black text-center bg-slate-50 rounded-lg overflow-hidden">
                     {printQueue.data?.photoUrl ? <img src={printQueue.data.photoUrl} className="w-full h-full object-cover" /> : 'Passport Photo'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-12 text-xl font-medium px-4">
                  <div className="space-y-10">
                    <p><span className="text-slate-400 uppercase text-xs font-bold block mb-1">Full Student Name</span> <span className="font-bold border-b border-slate-200 block pb-1">{printQueue.data?.fullName || '__________________________'}</span></p>
                    <p><span className="text-slate-400 uppercase text-xs font-bold block mb-1">Father's Name</span> <span className="font-bold border-b border-slate-200 block pb-1">{printQueue.data?.fatherName || '__________________________'}</span></p>
                    <p><span className="text-slate-400 uppercase text-xs font-bold block mb-1">Registration #</span> <span className="font-bold border-b border-slate-200 block pb-1 font-mono">{printQueue.data?.admissionNo || '__________________________'}</span></p>
                  </div>
                  <div className="space-y-10">
                    <p><span className="text-slate-400 uppercase text-xs font-bold block mb-1">Class / Grade</span> <span className="font-bold border-b border-slate-200 block pb-1">{printQueue.data?.admissionClass ? `Grade ${printQueue.data.admissionClass}` : '__________________________'}</span></p>
                    <p><span className="text-slate-400 uppercase text-xs font-bold block mb-1">National ID / Form-B</span> <span className="font-bold border-b border-slate-200 block pb-1">{printQueue.data?.formBNo || '__________________________'}</span></p>
                    <p><span className="text-slate-400 uppercase text-xs font-bold block mb-1">Issue Date</span> <span className="font-bold border-b border-slate-200 block pb-1">{new Date().toLocaleDateString()}</span></p>
                  </div>
                </div>

                <div className="mt-16 px-4">
                   <p className="text-slate-400 uppercase text-xs font-bold mb-2">Residential Address</p>
                   <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold italic min-h-[120px]">
                     {printQueue.data?.address || '________________________________________________________________________________________________________________________________________________________________'}
                   </div>
                </div>

                <div className="mt-auto pt-32 flex justify-between px-10">
                  <div className="text-center w-56 border-t-2 border-slate-800 pt-3">
                     <p className="text-xs font-black uppercase tracking-widest text-slate-800">Registrar Sign</p>
                  </div>
                  <div className="text-center w-56 border-t-2 border-slate-800 pt-3">
                     <p className="text-xs font-black uppercase tracking-widest text-slate-800">Principal Seal</p>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher Template */}
            {printQueue.type === 'TEACHER' && (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start border-b-4 border-slate-800 pb-8 mb-12">
                  <img src={LOGO_URL} alt="Logo" className="h-24" />
                  <div className="text-center flex-1 px-8">
                    <h1 className="text-3xl font-black text-blue-900 uppercase leading-none">{SCHOOL_NAME}</h1>
                    <p className="text-lg font-extrabold mt-6 border-y-2 border-slate-800 py-2 uppercase tracking-tight">Faculty Employment Profile</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-12 text-xl font-bold px-4">
                  <div className="space-y-10">
                    <p><span className="text-slate-400 text-xs font-bold uppercase block mb-1">Staff Full Name</span> <span className="border-b border-slate-200 block pb-1">{printQueue.data?.name || '__________________________'}</span></p>
                    <p><span className="text-slate-400 text-xs font-bold uppercase block mb-1">Designation</span> <span className="border-b border-slate-200 block pb-1">{printQueue.data?.designation || '__________________________'}</span></p>
                    <p><span className="text-slate-400 text-xs font-bold uppercase block mb-1">Specialization</span> <span className="border-b border-slate-200 block pb-1 italic text-blue-800">{printQueue.data?.subjects?.join(', ') || '__________________________'}</span></p>
                  </div>
                  <div className="space-y-10">
                    <p><span className="text-slate-400 text-xs font-bold uppercase block mb-1">Qualification</span> <span className="border-b border-slate-200 block pb-1">{printQueue.data?.qualification || '__________________________'}</span></p>
                    <p><span className="text-slate-400 text-xs font-bold uppercase block mb-1">Total Experience</span> <span className="border-b border-slate-200 block pb-1">{printQueue.data?.experience || '__________________________'}</span></p>
                    <p><span className="text-slate-400 text-xs font-bold uppercase block mb-1">Verification Date</span> <span className="border-b border-slate-200 block pb-1">{new Date().toLocaleDateString()}</span></p>
                  </div>
                </div>

                <div className="mt-auto flex justify-around items-end pb-20">
                   <div className="text-center w-56 border-t-2 border-slate-800 pt-3"><p className="text-xs font-black uppercase tracking-widest">Accounts Branch</p></div>
                   <div className="text-center w-56 border-t-2 border-slate-800 pt-3"><p className="text-xs font-black uppercase tracking-widest">Office Signature</p></div>
                </div>
              </div>
            )}

            {/* Subject Template */}
            {printQueue.type === 'SUBJECT' && (
              <div className="flex flex-col h-full items-center justify-center text-center">
                 <img src={LOGO_URL} alt="Logo" className="h-32 mb-8" />
                 <h1 className="text-4xl font-black text-blue-900 uppercase mb-4">{SCHOOL_NAME}</h1>
                 <h2 className="text-xl font-bold border-y-2 border-slate-900 py-3 mb-16 w-full max-w-lg">CURRICULUM RECORD ENTRY</h2>
                 <div className="text-3xl font-bold space-y-12">
                    <p className="flex items-center gap-6"><span className="text-slate-400 text-sm font-black uppercase tracking-widest">Name:</span> <span>{printQueue.data?.name}</span></p>
                    <p className="flex items-center gap-6"><span className="text-slate-400 text-sm font-black uppercase tracking-widest">Code:</span> <span className="font-mono text-blue-600">{printQueue.data?.code || 'UNASSIGNED'}</span></p>
                 </div>
                 <p className="mt-48 text-slate-400 text-sm italic font-medium uppercase tracking-widest">Academic Year {new Date().getFullYear()}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
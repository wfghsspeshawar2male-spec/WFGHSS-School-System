import React, { useState, useEffect } from 'react';
import { db } from '../services/storage';
import { Student, Teacher, TimetableEntry, LOGO_URL, SCHOOL_NAME } from '../types';

type ReportTab = 'STUDENTS' | 'TEACHERS' | 'TIMETABLE';
const PERIODS_REPORT = [1, 2, 3, 4, 5, 6, 7, 8];

const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('STUDENTS');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

  useEffect(() => {
    setStudents(db.getStudents());
    setTeachers(db.getTeachers());
    setTimetable(db.getTimetable());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const StudentsReport = () => (
    <div className="overflow-x-auto w-full">
      <div className="mb-4 flex gap-4 print:mb-2">
        <div className="text-sm font-medium text-gray-500">Total Students: {students.length}</div>
      </div>
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-bold uppercase bg-blue-50 text-blue-900 border">Adm #</th>
            <th className="px-4 py-2 text-left text-xs font-bold uppercase bg-blue-50 text-blue-900 border">Full Name</th>
            <th className="px-4 py-2 text-left text-xs font-bold uppercase bg-blue-50 text-blue-900 border">Father's Name</th>
            <th className="px-4 py-2 text-left text-xs font-bold uppercase bg-blue-50 text-blue-900 border">Class</th>
            <th className="px-4 py-2 text-left text-xs font-bold uppercase bg-blue-50 text-blue-900 border">Form B / CNIC</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.sort((a,b) => a.admissionClass.localeCompare(b.admissionClass)).map(s => (
            <tr key={s.id}>
              <td className="px-4 py-2 text-sm text-gray-900 border">{s.admissionNo}</td>
              <td className="px-4 py-2 text-sm font-semibold text-gray-900 border">{s.fullName}</td>
              <td className="px-4 py-2 text-sm text-gray-600 border">{s.fatherName}</td>
              <td className="px-4 py-2 text-sm text-gray-600 border">Grade {s.admissionClass}</td>
              <td className="px-4 py-2 text-sm text-gray-600 border">{s.formBNo || '-'}</td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">No student records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const TeachersReport = () => (
    <div className="overflow-x-auto w-full">
      <div className="mb-4 flex gap-4 print:mb-2">
        <div className="text-sm font-medium text-gray-500">Total Teachers: {teachers.length}</div>
        <div className="text-sm font-medium text-red-500">On Leave: {teachers.filter(t => t.isOnLeave).length}</div>
      </div>
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-bold uppercase bg-blue-50 text-blue-900 border">Name</th>
            <th className="px-4 py-2 text-left text-xs font-bold uppercase bg-blue-50 text-blue-900 border">Designation</th>
            <th className="px-4 py-2 text-left text-xs font-bold uppercase bg-blue-50 text-blue-900 border">Qualification</th>
            <th className="px-4 py-2 text-left text-xs font-bold uppercase bg-blue-50 text-blue-900 border">Subjects</th>
            <th className="px-4 py-2 text-left text-xs font-bold uppercase bg-blue-50 text-blue-900 border">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teachers.map(t => (
            <tr key={t.id}>
              <td className="px-4 py-2 text-sm font-semibold text-gray-900 border">{t.name}</td>
              <td className="px-4 py-2 text-sm text-gray-600 border">{t.designation}</td>
              <td className="px-4 py-2 text-sm text-gray-600 border">{t.qualification}</td>
              <td className="px-4 py-2 text-sm text-gray-600 border italic">{t.subjects.join(', ')}</td>
              <td className="px-4 py-2 text-sm border text-center">
                <span className={`px-2 inline-flex text-[10px] leading-5 font-bold rounded-full ${t.isOnLeave ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                   {t.isOnLeave ? 'ABSENT' : 'ACTIVE'}
                </span>
              </td>
            </tr>
          ))}
          {teachers.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">No faculty records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const TimetableReport = () => {
    const classes = Array.from(new Set(timetable.map(t => t.classId))).sort((a, b) => {
        // Simple alphanumeric sort, prioritizing numeric grades
        const valA = isNaN(Number(a)) ? 999 : Number(a);
        const valB = isNaN(Number(b)) ? 999 : Number(b);
        return valA - valB;
    });
    
    return (
      <div className="space-y-12 print:space-y-8">
        {classes.length === 0 && <p className="text-gray-500 italic text-center py-8">No timetable data available for reporting.</p>}
        {classes.map(className => {
            const classSchedule = timetable.filter(t => t.classId === className);
            return (
                <div key={className} className="break-inside-avoid border-b-2 border-dashed border-gray-200 pb-8 last:border-0">
                    <div className="flex justify-between items-baseline mb-3">
                        <h3 className="text-xl font-bold text-[#1e3a8a]">
                            Class Schedule: {isNaN(Number(className)) ? className : `Grade ${className}`}
                        </h3>
                        <span className="text-xs text-gray-400 font-medium">Academic Session 2024-25</span>
                    </div>
                    <table className="min-w-full divide-y divide-gray-300 border-2 border-gray-300 text-[10px]">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-2 py-2 border-r-2 border-gray-300 bg-blue-100 w-20 font-bold uppercase text-blue-900">Day</th>
                                {PERIODS_REPORT.map(p => (
                                    <th key={p} className="px-1 py-2 border-r border-gray-300 font-bold uppercase text-blue-900">Pd {p}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                <tr key={day} className="h-10">
                                    <td className="font-bold px-2 py-1 border-r-2 border-gray-300 bg-gray-50 text-gray-700">{day}</td>
                                    {PERIODS_REPORT.map(period => {
                                        if (day === 'Friday' && period > 5) {
                                            return <td key={period} className="px-1 py-1 border-r border-gray-300 bg-gray-100/50"></td>
                                        }

                                        const entry = classSchedule.find(t => t.day === day && t.period === period);
                                        const teacher = teachers.find(t => t.id === entry?.teacherId);
                                        return (
                                            <td key={period} className="px-1 py-1 border-r border-gray-300 text-center align-middle">
                                                {entry ? (
                                                    <div className="leading-tight">
                                                        <div className="font-bold text-gray-900">{entry.subject}</div>
                                                        <div className="text-[8px] text-gray-500 uppercase mt-0.5">{teacher?.name.split(' ')[0]}</div>
                                                    </div>
                                                ) : <span className="text-gray-300">-</span>}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        })}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#1e3a8a] print:shadow-none print:border-0 print:p-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">System Reports</h2>
           <p className="text-sm text-gray-500">Official summaries and printable documentation.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-[#1e3a8a] text-white px-6 py-2.5 rounded-md hover:bg-blue-900 flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          <span className="font-semibold">Print Official Report</span>
        </button>
      </div>

      <div className="mb-6 border-b border-gray-200 print:hidden">
        <nav className="-mb-px flex space-x-8">
          {(['STUDENTS', 'TEACHERS', 'TIMETABLE'] as ReportTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-blue-800 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-all`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()} Records
            </button>
          ))}
        </nav>
      </div>

      {/* Printable Area Wrapper */}
      <div className="print-report-container">
        {/* Printable Header - Only visible when printing */}
        <div className="hidden print:flex flex-col items-center mb-10 pb-6 border-b-4 border-double border-[#1e3a8a]">
            <div className="flex items-center gap-6 mb-4">
              <img src={LOGO_URL} alt="Logo" className="h-24 w-auto" />
              <div className="text-center">
                <h1 className="text-4xl font-black text-[#1e3a8a] tracking-tight">{SCHOOL_NAME}</h1>
                <p className="text-xl font-bold text-gray-700 mt-1 uppercase tracking-widest">Peshawar-2 (Boys Branch)</p>
                <p className="text-sm text-gray-500 font-medium mt-1 italic">Quality Education for a Brighter Future</p>
              </div>
            </div>
            
            <div className="w-full flex justify-between items-end mt-4 px-2">
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-800 underline decoration-blue-500 underline-offset-8">
                    {activeTab} DATABASE REPORT
                  </h2>
                </div>
                <div className="text-right text-xs text-gray-500 font-mono">
                  <p>REPORT REF: WFGHSS-REV-{new Date().getFullYear()}-{activeTab.substring(0,3)}</p>
                  <p>PRINTED ON: {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>

        {/* Dynamic Report Content */}
        <div className="report-content-body">
          {activeTab === 'STUDENTS' && <StudentsReport />}
          {activeTab === 'TEACHERS' && <TeachersReport />}
          {activeTab === 'TIMETABLE' && <TimetableReport />}
        </div>

        {/* Printable Footer - Only visible when printing */}
        <div className="hidden print:block mt-20 pt-10 border-t border-gray-300">
            <div className="grid grid-cols-3 gap-10 text-center">
              <div className="flex flex-col items-center">
                <div className="w-40 border-b border-gray-800 mb-2"></div>
                <p className="text-xs font-bold text-gray-700 uppercase">Class Incharge</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-40 border-b border-gray-800 mb-2"></div>
                <p className="text-xs font-bold text-gray-700 uppercase">Academic Coordinator</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-40 border-b border-gray-800 mb-2"></div>
                <p className="text-xs font-bold text-gray-700 uppercase">Principal Signature</p>
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-12 italic">This is a computer-generated report and does not require a physical stamp for internal use.</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
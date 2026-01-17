import React, { useState, useEffect } from 'react';
import { TimetableEntry, Teacher } from '../types';
import { db } from '../services/storage';
import { generateTimetableAI } from '../services/gemini';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const CLASSES = [
  'Nursery', 'Prep', 
  '1', '2', '3', '4', '5', 
  '6', '7', '8', 
  '9', '10', '11', '12'
];

type ViewMode = 'CLASS' | 'MASTER';

const TimetableView: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('CLASS');
  
  // States for Class View
  const [selectedClass, setSelectedClass] = useState('11');
  
  // States for Master View
  const [selectedDay, setSelectedDay] = useState('Monday');

  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    setTimetable(db.getTimetable());
    setTeachers(db.getTeachers());
  }, []);

  const handleGenerate = async (mode: 'single' | 'all') => {
    if(!process.env.API_KEY) {
      alert("API Key missing. Cannot generate timetable.");
      return;
    }
    setLoading(true);
    try {
      const classesToGenerate = mode === 'all' ? CLASSES : [selectedClass];
      
      const newEntries = await generateTimetableAI(teachers, classesToGenerate);
      
      if (newEntries.length > 0) {
        // Remove existing entries for the generated classes to avoid duplicates/conflicts
        const currentTimetable = db.getTimetable();
        const filteredTimetable = currentTimetable.filter(t => !classesToGenerate.includes(t.classId));
        
        const updatedTimetable = [...filteredTimetable, ...newEntries];
        db.saveTimetable(updatedTimetable);
        setTimetable(updatedTimetable);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate timetable.");
    } finally {
      setLoading(false);
    }
  };

  const getClassCellData = (day: string, period: number) => {
    const entry = timetable.find(t => t.day === day && t.period === period && t.classId === selectedClass);
    if (!entry) return null;
    const teacher = teachers.find(t => t.id === entry.teacherId);
    return { subject: entry.subject, teacherName: teacher?.name || 'Unknown' };
  };

  const getMasterCellData = (className: string, period: number) => {
    const entry = timetable.find(t => t.day === selectedDay && t.period === period && t.classId === className);
    if (!entry) return null;
    const teacher = teachers.find(t => t.id === entry.teacherId);
    return { subject: entry.subject, teacherName: teacher?.name || 'Unknown' };
  }

  const BreakColumnHeader = () => (
    <th className="px-1 py-3 bg-gray-200 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-8 writing-mode-vertical rotate-180">
      <span className="block transform rotate-90 whitespace-nowrap">BREAK (15m)</span>
    </th>
  );

  const BreakColumnCell = () => (
    <td className="px-1 py-4 bg-gray-100 text-center border-l border-r border-gray-200">
      <div className="h-full w-full bg-gray-200/50"></div>
    </td>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#1e3a8a]">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-6 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Academic Year Timetable</h2>
          <p className="text-sm text-gray-500">Master schedule management for entire school</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
          {/* View Mode Toggle */}
          <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
            <button 
              onClick={() => setViewMode('CLASS')}
              className={`px-4 py-2 rounded-md transition-all ${viewMode === 'CLASS' ? 'bg-white shadow text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Single Class
            </button>
            <button 
              onClick={() => setViewMode('MASTER')}
              className={`px-4 py-2 rounded-md transition-all ${viewMode === 'MASTER' ? 'bg-white shadow text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Master View (All)
            </button>
          </div>

          {/* Contextual Filters */}
          {viewMode === 'CLASS' ? (
             <select 
               value={selectedClass} 
               onChange={(e) => setSelectedClass(e.target.value)}
               className="border-gray-300 border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
             >
               {CLASSES.map(c => (
                 <option key={c} value={c}>{isNaN(Number(c)) ? c : `Grade ${c}`}</option>
               ))}
             </select>
          ) : (
            <select 
               value={selectedDay} 
               onChange={(e) => setSelectedDay(e.target.value)}
               className="border-gray-300 border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
             >
               {DAYS.map(d => (
                 <option key={d} value={d}>{d}</option>
               ))}
             </select>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {viewMode === 'CLASS' && (
              <button 
                onClick={() => handleGenerate('single')} 
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-blue-900'}`}
              >
                {loading ? 'Generating...' : `Generate ${selectedClass}`}
              </button>
            )}
            <button 
              onClick={() => handleGenerate('all')} 
              disabled={loading}
              className={`px-4 py-2 rounded-md text-blue-800 bg-blue-50 border border-blue-200 text-sm font-medium hover:bg-blue-100 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'AI Working...' : 'Generate Yearly Master'}
            </button>
          </div>
        </div>
      </div>

      {/* Class View Table */}
      {viewMode === 'CLASS' && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32 bg-blue-50">
                  Day
                </th>
                {PERIODS.map(p => (
                  <React.Fragment key={p}>
                    {p === 6 && <BreakColumnHeader />}
                    <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-blue-50 min-w-[100px]">
                      Period {p}
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {DAYS.map(day => (
                <tr key={day} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 bg-gray-50 border-r border-gray-100">
                    {day}
                  </td>
                  {PERIODS.map(period => {
                    // Logic to hide/show cells based on day rules
                    const isFriday = day === 'Friday';
                    if (isFriday && period > 5) {
                         // Only render these cells once if needed, or just render empty
                         if (period === 6) return (
                             <React.Fragment key={`${day}-end`}>
                                 <BreakColumnCell />
                                 <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-400 bg-gray-50 italic">
                                     Home Time (Friday ends at Period 5)
                                 </td>
                             </React.Fragment>
                         );
                         return null; // Don't render cells for 7 and 8 on Friday as we colspanned
                    }

                    const data = getClassCellData(day, period);
                    return (
                      <React.Fragment key={`${day}-${period}`}>
                        {period === 6 && <BreakColumnCell />}
                        <td className="px-2 py-4 text-center border-l border-gray-100">
                          {data ? (
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-blue-700 text-sm">{data.subject}</span>
                              <span className="text-xs text-gray-500 mt-1">{data.teacherName}</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                              Free
                            </span>
                          )}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Master View Table */}
      {viewMode === 'MASTER' && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40 bg-blue-50">
                  Class
                </th>
                {PERIODS.map(p => (
                  <React.Fragment key={p}>
                    {p === 6 && <BreakColumnHeader />}
                    <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-blue-50 min-w-[100px]">
                      Period {p}
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {CLASSES.map(className => (
                <tr key={className} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 bg-gray-50 border-r border-gray-100">
                    {isNaN(Number(className)) ? className : `Grade ${className}`}
                  </td>
                  {PERIODS.map(period => {
                    // Logic for Friday Master View? 
                    // Master view selects a specific day. If selectedDay is Friday, we should handle 6,7,8
                    const isFriday = selectedDay === 'Friday';
                     if (isFriday && period > 5) {
                         if (period === 6) return (
                             <React.Fragment key={`${className}-end`}>
                                 <BreakColumnCell />
                                 <td colSpan={3} className="px-6 py-4 text-center text-xs text-gray-400 bg-gray-50">
                                     -
                                 </td>
                             </React.Fragment>
                         );
                         return null;
                    }

                    const data = getMasterCellData(className, period);
                    return (
                      <React.Fragment key={`${className}-${period}`}>
                        {period === 6 && <BreakColumnCell />}
                        <td className="px-2 py-4 text-center border-l border-gray-100">
                          {data ? (
                            <div className="flex flex-col items-center">
                               <span className="font-semibold text-blue-700 text-sm">{data.subject}</span>
                               <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded mt-1">{data.teacherName}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 text-center space-y-1">
        <p>* "Generate Yearly Master" uses AI to create a conflict-free annual schedule.</p>
        <p>* Rules: 35 min periods. Mon-Thu (8 periods), Friday (5 periods). Break after Period 5.</p>
      </div>
    </div>
  );
};

export default TimetableView;
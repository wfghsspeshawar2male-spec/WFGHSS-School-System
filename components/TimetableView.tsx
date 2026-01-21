import React, { useState, useEffect } from 'react';
import { TimetableEntry, Teacher, TimetableSettings } from '../types';
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
  const [showSettings, setShowSettings] = useState(false);
  
  const [settings, setSettings] = useState<TimetableSettings>(db.getSettings());
  
  // States for Class View
  const [selectedClass, setSelectedClass] = useState('11');
  
  // States for Master View
  const [selectedDay, setSelectedDay] = useState('Monday');

  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    setTimetable(db.getTimetable());
    setTeachers(db.getTeachers());
    setSettings(db.getSettings());
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

  const handleSaveSettings = () => {
    db.saveSettings(settings);
    setShowSettings(false);
  };

  const calculatePeriodTime = (periodNumber: number) => {
    const [startHour, startMin] = settings.startTime.split(':').map(Number);
    let totalMinutes = startHour * 60 + startMin;

    for (let i = 1; i <= periodNumber; i++) {
      const periodStart = totalMinutes;
      const periodEnd = periodStart + settings.periodDuration;
      
      if (i === periodNumber) {
        const format = (m: number) => {
          const h = Math.floor(m / 60) % 24;
          const mins = m % 60;
          return `${h.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        };
        return `${format(periodStart)} - ${format(periodEnd)}`;
      }

      totalMinutes += settings.periodDuration;
      if (i === settings.breakAfterPeriod) {
        totalMinutes += settings.breakDuration;
      }
    }
    return "";
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
    <th className="px-1 py-3 bg-orange-50 text-center text-[9px] font-bold text-orange-600 uppercase tracking-wider w-10 relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="transform -rotate-90 whitespace-nowrap">BREAK ({settings.breakDuration}m)</span>
      </div>
    </th>
  );

  const BreakColumnCell = () => (
    <td className="px-1 py-4 bg-orange-50/30 text-center border-l border-r border-orange-100">
      <div className="h-full w-full"></div>
    </td>
  );

  const handlePrintTimetable = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#1e3a8a]">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border-t-8 border-blue-800">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Timetable Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">School Session</label>
                <select 
                  value={settings.sessionName}
                  onChange={(e) => setSettings({...settings, sessionName: e.target.value as any})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Summer">Summer Session</option>
                  <option value="Winter">Winter Session</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time (Morning Bell)</label>
                <input 
                  type="time" 
                  value={settings.startTime}
                  onChange={(e) => setSettings({...settings, startTime: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Class Duration (m)</label>
                  <input 
                    type="number" 
                    value={settings.periodDuration}
                    onChange={(e) => setSettings({...settings, periodDuration: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Break Duration (m)</label>
                  <input 
                    type="number" 
                    value={settings.breakDuration}
                    onChange={(e) => setSettings({...settings, breakDuration: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Break After Period</label>
                <select 
                  value={settings.breakAfterPeriod}
                  onChange={(e) => setSettings({...settings, breakAfterPeriod: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>After Period {n}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
              <button onClick={handleSaveSettings} className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 shadow-lg">Apply Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-6 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-800">School Timetable</h2>
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${settings.sessionName === 'Summer' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
              {settings.sessionName} Session
            </span>
          </div>
          <p className="text-sm text-gray-500">Managing {settings.periodDuration}m classes starting at {settings.startTime}</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
          <button 
            onClick={handlePrintTimetable}
            className="flex items-center gap-2 px-3 py-2 bg-[#1e3a8a] text-white rounded-md hover:bg-blue-900 text-sm font-medium transition-colors shadow-sm print:hidden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Timetable
          </button>

          {/* Settings Button */}
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors print:hidden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Session Config
          </button>

          {/* View Mode Toggle */}
          <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium print:hidden">
            <button 
              onClick={() => setViewMode('CLASS')}
              className={`px-4 py-2 rounded-md transition-all ${viewMode === 'CLASS' ? 'bg-white shadow text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Class View
            </button>
            <button 
              onClick={() => setViewMode('MASTER')}
              className={`px-4 py-2 rounded-md transition-all ${viewMode === 'MASTER' ? 'bg-white shadow text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Master View
            </button>
          </div>

          {/* Contextual Filters */}
          {viewMode === 'CLASS' ? (
             <select 
               value={selectedClass} 
               onChange={(e) => setSelectedClass(e.target.value)}
               className="border-gray-300 border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[120px] print:hidden"
             >
               {CLASSES.map(c => (
                 <option key={c} value={c}>{isNaN(Number(c)) ? c : `Grade ${c}`}</option>
               ))}
             </select>
          ) : (
            <select 
               value={selectedDay} 
               onChange={(e) => setSelectedDay(e.target.value)}
               className="border-gray-300 border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[120px] print:hidden"
             >
               {DAYS.map(d => (
                 <option key={d} value={d}>{d}</option>
               ))}
             </select>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 print:hidden">
            <button 
              onClick={() => handleGenerate('all')} 
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'AI Syncing...' : 'AI Generate All'}
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner bg-gray-50/30">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-36 bg-blue-50/50 sticky left-0 z-10 border-r">
                {viewMode === 'CLASS' ? 'Day' : 'Grade'}
              </th>
              {PERIODS.map(p => (
                <React.Fragment key={p}>
                  {p === settings.breakAfterPeriod + 1 && <BreakColumnHeader />}
                  <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-blue-50/30 min-w-[110px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-blue-800">Period {p}</span>
                      <span className="text-[10px] font-medium text-gray-400 font-mono tracking-tighter">
                        {calculatePeriodTime(p)}
                      </span>
                    </div>
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(viewMode === 'CLASS' ? DAYS : CLASSES).map(item => (
              <tr key={item} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 bg-gray-50/50 border-r sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  {viewMode === 'CLASS' ? item : (isNaN(Number(item)) ? item : `Grade ${item}`)}
                </td>
                {PERIODS.map(period => {
                  const isFriday = (viewMode === 'CLASS' ? item === 'Friday' : selectedDay === 'Friday');
                  if (isFriday && period > 5) {
                    if (period === settings.breakAfterPeriod + 1) {
                      return (
                        <React.Fragment key={`${item}-end`}>
                          <BreakColumnCell />
                          <td colSpan={PERIODS.length - period + 1} className="px-6 py-4 text-center text-[11px] text-gray-400 bg-gray-50/50 italic border-l">
                            Friday Home Time (Early Departure)
                          </td>
                        </React.Fragment>
                      );
                    }
                    return null;
                  }

                  const data = viewMode === 'CLASS' 
                    ? getClassCellData(item, period) 
                    : getMasterCellData(item, period);

                  return (
                    <React.Fragment key={`${item}-${period}`}>
                      {period === settings.breakAfterPeriod + 1 && <BreakColumnCell />}
                      <td className="px-2 py-4 text-center border-l border-gray-100 group">
                        {data ? (
                          <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                            <span className="font-bold text-blue-900 text-sm">{data.subject}</span>
                            <span className="text-[10px] text-gray-500 mt-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{data.teacherName}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-300 border border-gray-100">
                            FREE
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

      <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100 print:hidden">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div className="text-xs text-blue-800 space-y-1">
            <p className="font-bold">Operational Rules:</p>
            <p>• Mon-Thu: 8 periods | Friday: 5 periods.</p>
            <p>• Current Session: {settings.sessionName} starts at {settings.startTime}.</p>
            <p>• AI Generation matches teacher expertise to subjects and prevents double-booking.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableView;
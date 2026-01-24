import React, { useState, useEffect } from 'react';
import { Teacher, Subject, LOGO_URL, SCHOOL_NAME } from '../types';
import { db } from '../services/storage';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  onPrint?: (teacher: Partial<Teacher>) => void;
  initialData?: Teacher | null;
}

const TeacherForm: React.FC<Props> = ({ onSuccess, onCancel, onDelete, onPrint, initialData }) => {
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    designation: '',
    subjects: [],
    qualification: '',
    experience: '',
    isOnLeave: false
  });
  
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    setAvailableSubjects(db.getSubjects());
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && !formData.subjects?.includes(val)) {
      setFormData({ ...formData, subjects: [...(formData.subjects || []), val] });
    }
    e.target.value = ""; 
  };

  const removeSubject = (s: string) => {
    setFormData({ ...formData, subjects: formData.subjects?.filter(sub => sub !== s) || [] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Faculty Name is mandatory.");
      return;
    }
    const teacherToSave: Teacher = {
      id: initialData?.id || crypto.randomUUID(),
      name: formData.name || '',
      designation: formData.designation || '',
      subjects: formData.subjects || [],
      qualification: formData.qualification || '',
      experience: formData.experience || '',
      isOnLeave: formData.isOnLeave || false
    };
    db.saveTeacher(teacherToSave);
    onSuccess();
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-4xl mx-auto border border-slate-100">
      <div className="flex flex-col items-center mb-10 pb-6 border-b border-slate-100">
        <img src={LOGO_URL} alt="Logo" className="h-16 mb-4" />
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{SCHOOL_NAME}</h2>
        <h3 className="text-sm font-bold text-blue-600 uppercase mt-1 tracking-widest">{initialData ? 'Update Faculty' : 'Faculty Registration'}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name *</label><input required name="name" value={formData.name} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Designation</label><input name="designation" value={formData.designation} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Qualification</label><input name="qualification" value={formData.qualification} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Years of Experience</label><input name="experience" value={formData.experience} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all" /></div>
          
          <div className="md:col-span-2 space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Subjects</label>
            <div className="flex gap-2 flex-wrap min-h-[50px] p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
              {formData.subjects?.map(s => (
                <span key={s} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                  {s} <button type="button" onClick={() => removeSubject(s)} className="bg-blue-800 rounded px-1">×</button>
                </span>
              ))}
              {(!formData.subjects || formData.subjects.length === 0) && <p className="text-slate-300 text-xs italic italic">No subjects selected...</p>}
            </div>
            <select onChange={handleSubjectSelect} className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600" defaultValue="">
              <option value="" disabled>Add a subject...</option>
              {availableSubjects.filter(s => !formData.subjects?.includes(s.name)).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-100">
          <div className="flex gap-3">
             {initialData && <button type="button" onClick={() => onDelete?.(initialData.id)} className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-xs hover:bg-red-100">DELETE</button>}
             <button type="button" onClick={() => onPrint?.({})} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200">PRINT EMPTY</button>
             <button type="button" onClick={() => onPrint?.(formData)} className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                PRINT DOSSIER
             </button>
          </div>
          <div className="flex gap-4">
             <button type="button" onClick={onCancel} className="px-8 py-3 text-slate-400 font-bold text-sm">CANCEL</button>
             <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl font-extrabold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700">SAVE FACULTY</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;
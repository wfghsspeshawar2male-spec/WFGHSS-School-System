import React, { useState, useEffect } from 'react';
import { Student, LOGO_URL, SCHOOL_NAME } from '../types';
import { db } from '../services/storage';

interface Props {
  initialData?: Student | null;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  onPrint?: (student: Partial<Student>) => void;
}

const StudentForm: React.FC<Props> = ({ initialData, onSuccess, onCancel, onDelete, onPrint }) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    fatherName: '',
    admissionNo: '',
    formBNo: '',
    address: '',
    admissionClass: '',
    photoUrl: ''
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.admissionNo) {
      alert("Please fill required fields: Full Name and Admission Number.");
      return;
    }
    const studentToSave: Student = {
      id: initialData?.id || crypto.randomUUID(),
      fullName: formData.fullName || '',
      fatherName: formData.fatherName || '',
      admissionNo: formData.admissionNo || '',
      formBNo: formData.formBNo || '',
      address: formData.address || '',
      admissionClass: formData.admissionClass || '',
      photoUrl: formData.photoUrl || '',
      leaves: initialData?.leaves || [],
      attendance: initialData?.attendance || []
    };
    db.saveStudent(studentToSave);
    onSuccess();
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-4xl mx-auto border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col items-center mb-10 pb-6 border-b border-slate-100">
        <img src={LOGO_URL} alt="School Logo" className="h-16 w-auto mb-3" />
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{SCHOOL_NAME}</h2>
        <h3 className="text-sm font-bold text-blue-600 uppercase mt-1 tracking-widest">{initialData ? 'Update Profile' : 'Student Enrollment'}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-center p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="relative">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-200 flex items-center justify-center">
                  {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg><input type="file" accept="image/*" onChange={handleFileChange} className="hidden" /></label>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name *</label><input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-600 transition-all outline-none" placeholder="e.g. Abdullah Khan" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Father's Name</label><input name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all" placeholder="e.g. Javed Khan" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admission # *</label><input required name="admissionNo" value={formData.admissionNo} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all font-mono" placeholder="G-10293" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">B-Form / ID</label><input name="formBNo" value={formData.formBNo} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all" placeholder="17301-0000000-0" /></div>
          <div className="md:col-span-2 space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assign Class</label>
            <select name="admissionClass" value={formData.admissionClass} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all">
              <option value="">Select Grade</option>
              {['Nursery','Prep','1','2','3','4','5','6','7','8','9','10','11','12'].map(c=><option key={c} value={c}>{isNaN(Number(c)) ? c : `Grade ${c}`}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Residential Address</label><textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all" placeholder="Complete postal address..."></textarea></div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-100">
          <div className="flex gap-3">
             {initialData && <button type="button" onClick={() => onDelete?.(initialData.id)} className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">DELETE</button>}
             <button type="button" onClick={() => onPrint?.({})} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors">PRINT EMPTY</button>
             <button type="button" onClick={() => onPrint?.(formData)} className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                PRINT DATA
             </button>
          </div>
          <div className="flex gap-4">
             <button type="button" onClick={onCancel} className="px-8 py-3 text-slate-400 font-bold text-sm hover:text-slate-600">CANCEL</button>
             <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl font-extrabold text-sm shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all">SAVE RECORD</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
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
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSubject = e.target.value;
    if (selectedSubject && !formData.subjects?.includes(selectedSubject)) {
      setFormData({
        ...formData,
        subjects: [...(formData.subjects || []), selectedSubject]
      });
    }
    e.target.value = ""; 
  };

  const removeSubject = (subjectToRemove: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects?.filter(s => s !== subjectToRemove) || []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Teacher name is required.");
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
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl mx-auto border-t-8 border-[#1e3a8a]">
      <div className="flex flex-col items-center mb-8 pb-4 border-b border-gray-200">
        <img src={LOGO_URL} alt="School Logo" className="h-20 w-auto mb-2" />
        <h2 className="text-xl font-bold text-[#1e3a8a]">{SCHOOL_NAME}</h2>
        <h3 className="text-lg font-medium text-gray-600">
          {initialData ? 'Edit Faculty Record' : 'Faculty Registration'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500" placeholder="e.g. Sarah Connor" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Designation</label>
            <input required name="designation" value={formData.designation} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500" placeholder="e.g. Senior Lecturer" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Qualification</label>
            <input required name="qualification" value={formData.qualification} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500" placeholder="e.g. M.Sc Mathematics" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Experience</label>
            <input name="experience" value={formData.experience} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500" placeholder="e.g. 5 Years" />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-gray-700">Subjects Taught</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {formData.subjects?.map(subject => (
                <span key={subject} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {subject}
                  <button type="button" onClick={() => removeSubject(subject)} className="ml-2 text-blue-400 hover:text-blue-600 focus:outline-none">×</button>
                </span>
              ))}
            </div>
            <select onChange={handleSubjectSelect} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500" defaultValue="">
              <option value="" disabled>Select a subject to add...</option>
              {availableSubjects.filter(s => !formData.subjects?.includes(s.name)).map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
          <div className="flex gap-2">
            {initialData ? (
               <button type="button" onClick={() => onDelete?.(initialData.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors border border-red-200">Delete Faculty</button>
            ) : (
               <button type="button" onClick={() => setFormData({name:'', designation:'', qualification:'', experience:'', subjects:[], isOnLeave:false})} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors border">Clear Form</button>
            )}
            <button type="button" onClick={() => onPrint?.(formData)} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors border flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Form
            </button>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-[#1e3a8a] hover:bg-blue-900">
              {initialData ? 'Update Profile' : 'Save Record'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;
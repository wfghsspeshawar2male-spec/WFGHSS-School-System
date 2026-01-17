import React, { useState, useEffect } from 'react';
import { Teacher, Subject, LOGO_URL, SCHOOL_NAME } from '../types';
import { db } from '../services/storage';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Teacher | null;
}

const TeacherForm: React.FC<Props> = ({ onSuccess, onCancel, initialData }) => {
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
    e.target.value = ""; // Reset dropdown
  };

  const removeSubject = (subjectToRemove: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects?.filter(s => s !== subjectToRemove) || []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

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
      {/* Form Header with Logo */}
      <div className="flex flex-col items-center mb-8 pb-4 border-b border-gray-200">
        <img src={LOGO_URL} alt="School Logo" className="h-20 w-auto mb-2" />
        <h2 className="text-xl font-bold text-[#1e3a8a]">{SCHOOL_NAME}</h2>
        <h3 className="text-lg font-medium text-gray-600">
          {initialData ? 'Edit Faculty Record' : 'New Faculty Registration'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              required 
              name="name" 
              value={formData.name}
              onChange={handleChange} 
              className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="e.g. Sarah Connor" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Designation</label>
            <input 
              required 
              name="designation" 
              value={formData.designation}
              onChange={handleChange} 
              className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="e.g. Senior Lecturer" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Qualification</label>
            <input 
              required 
              name="qualification" 
              value={formData.qualification}
              onChange={handleChange} 
              className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="e.g. M.Sc Mathematics" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Experience</label>
            <input 
              name="experience" 
              value={formData.experience}
              onChange={handleChange} 
              className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="e.g. 5 Years" 
            />
          </div>
          
          {/* Subject Selection UI */}
          <div className="col-span-1 md:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-gray-700">Subjects Taught</label>
            
            <div className="flex gap-2 flex-wrap mb-2">
              {formData.subjects?.map(subject => (
                <span key={subject} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {subject}
                  <button 
                    type="button" 
                    onClick={() => removeSubject(subject)}
                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                </span>
              ))}
              {(!formData.subjects || formData.subjects.length === 0) && (
                <span className="text-sm text-gray-500 italic p-1">No subjects selected. Add from the list below.</span>
              )}
            </div>

            <select 
              onChange={handleSubjectSelect} 
              className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue=""
            >
              <option value="" disabled>Select a subject to add...</option>
              {availableSubjects
                .filter(s => !formData.subjects?.includes(s.name))
                .map(s => (
                  <option key={s.id} value={s.name}>{s.name} {s.code ? `(${s.code})` : ''}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Select subjects from the dropdown to add them to the teacher's profile.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
          <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e3a8a] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            {initialData ? 'Update Teacher' : 'Save Teacher'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;
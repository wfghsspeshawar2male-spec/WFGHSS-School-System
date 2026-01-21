import React, { useState, useEffect } from 'react';
import { Student, LOGO_URL, SCHOOL_NAME } from '../types';
import { db } from '../services/storage';

interface Props {
  initialData?: Student | null;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  onPrint?: (student: Student) => void;
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
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.admissionNo) return;

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
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl mx-auto border-t-8 border-[#1e3a8a]">
      {/* Form Header with Logo */}
      <div className="flex flex-col items-center mb-8 pb-4 border-b border-gray-200">
        <img src={LOGO_URL} alt="School Logo" className="h-20 w-auto mb-2" />
        <h2 className="text-xl font-bold text-[#1e3a8a]">{SCHOOL_NAME}</h2>
        <h3 className="text-lg font-medium text-gray-600">
            {initialData ? 'Update Student Record' : 'New Admission Registration'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Top Section: Photo & Basic Identification */}
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="relative group">
                {formData.photoUrl ? (
                <img 
                    src={formData.photoUrl} 
                    alt="Preview" 
                    className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-lg" 
                />
                ) : (
                <div className="h-32 w-32 rounded-full bg-blue-50 flex items-center justify-center border-4 border-white shadow-sm">
                    <svg className="h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                )}
                <div className="absolute bottom-0 right-0">
                   <label htmlFor="photo-upload" className="cursor-pointer bg-[#1e3a8a] text-white p-2 rounded-full hover:bg-blue-900 shadow-sm flex items-center justify-center w-8 h-8">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                   </label>
                   <input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Student Profile Picture</p>
        </div>

        {/* Middle Section: Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input required name="fullName" value={formData.fullName} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Ali Khan" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Father's Name</label>
            <input required name="fatherName" value={formData.fatherName} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Ahmed Khan" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Admission No</label>
            <input required name="admissionNo" value={formData.admissionNo} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Unique ID" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Form B / ID No</label>
            <input name="formBNo" value={formData.formBNo} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="National ID" />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-gray-700">Admission Class</label>
            <select name="admissionClass" value={formData.admissionClass} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Class</option>
              <option value="Nursery">Nursery</option>
              <option value="Prep">Prep</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11 (High Secondary)</option>
              <option value="12">Grade 12 (High Secondary)</option>
            </select>
          </div>
        </div>
        
        {/* Bottom Section: Address */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Residential Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" rows={3} placeholder="Full postal address"></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
          <div className="flex gap-2">
            {initialData && (
              <>
                <button 
                  type="button" 
                  onClick={() => onDelete?.(initialData.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Delete Profile
                </button>
                <button 
                  type="button" 
                  onClick={() => onPrint?.(initialData)}
                  className="px-4 py-2 bg-gray-50 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors border flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Print
                </button>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-[#1e3a8a] hover:bg-blue-900">
              {initialData ? 'Update Profile' : 'Register Student'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
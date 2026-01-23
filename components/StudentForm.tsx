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
    if (!formData.fullName || !formData.admissionNo) {
      alert("Name and Admission Number are required to save.");
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
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl mx-auto border-t-8 border-[#1e3a8a]">
      <div className="flex flex-col items-center mb-8 pb-4 border-b border-gray-200">
        <img src={LOGO_URL} alt="School Logo" className="h-20 w-auto mb-2" />
        <h2 className="text-xl font-bold text-[#1e3a8a]">{SCHOOL_NAME}</h2>
        <h3 className="text-lg font-medium text-gray-600">{initialData ? 'Update Record' : 'Admission Registration'}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="relative group">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-lg" />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-blue-50 flex items-center justify-center border-4 border-white"><svg className="h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg></div>
                )}
                <label className="absolute bottom-0 right-0 cursor-pointer bg-blue-800 text-white p-1.5 rounded-full shadow-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg><input type="file" accept="image/*" onChange={handleFileChange} className="hidden" /></label>
            </div>
            <p className="mt-2 text-xs text-gray-500">Student Profile Image</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium">Full Name</label><input name="fullName" value={formData.fullName} onChange={handleChange} className="block w-full border rounded p-2 mt-1 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium">Father's Name</label><input name="fatherName" value={formData.fatherName} onChange={handleChange} className="block w-full border rounded p-2 mt-1 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium">Admission #</label><input name="admissionNo" value={formData.admissionNo} onChange={handleChange} className="block w-full border rounded p-2 mt-1 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium">B-Form / CNIC</label><input name="formBNo" value={formData.formBNo} onChange={handleChange} className="block w-full border rounded p-2 mt-1 focus:ring-blue-500" /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium">Admission Class</label>
            <select name="admissionClass" value={formData.admissionClass} onChange={handleChange} className="block w-full border rounded p-2 mt-1">
              <option value="">Select Class</option>
              {['Nursery','Prep','1','2','3','4','5','6','7','8','9','10','11','12'].map(c=><option key={c} value={c}>{isNaN(Number(c)) ? c : `Grade ${c}`}</option>)}
            </select>
          </div>
          <div className="md:col-span-2"><label className="block text-sm font-medium">Residential Address</label><textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="block w-full border rounded p-2 mt-1"></textarea></div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between pt-6 border-t gap-4">
          <div className="flex gap-2">
            {initialData && <button type="button" onClick={() => onDelete?.(initialData.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded border border-red-200">Delete</button>}
            <button type="button" onClick={() => onPrint?.(formData)} className="px-4 py-2 bg-gray-50 text-gray-700 rounded border flex items-center gap-1 hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Form
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="px-6 py-2 border rounded text-gray-700">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-800 text-white rounded hover:bg-blue-900">{initialData ? 'Update Record' : 'Save Admission'}</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
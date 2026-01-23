import React, { useState, useEffect } from 'react';
import { Subject, LOGO_URL, SCHOOL_NAME } from '../types';
import { db } from '../services/storage';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  onPrint?: (subject: Partial<Subject>) => void;
  initialData?: Subject | null;
}

const SubjectForm: React.FC<Props> = ({ onSuccess, onCancel, onDelete, onPrint, initialData }) => {
  const [formData, setFormData] = useState<Partial<Subject>>({
    name: '',
    code: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Subject name is required.");
      return;
    }
    const subjectToSave: Subject = {
      id: initialData?.id || crypto.randomUUID(),
      name: formData.name || '',
      code: formData.code || '',
    };
    db.saveSubject(subjectToSave);
    onSuccess();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg mx-auto border-t-8 border-[#1e3a8a]">
      <div className="flex flex-col items-center mb-8 pb-4 border-b border-gray-200">
        <img src={LOGO_URL} alt="School Logo" className="h-16 w-auto mb-2" />
        <h2 className="text-xl font-bold text-[#1e3a8a]">{SCHOOL_NAME}</h2>
        <h3 className="text-lg font-medium text-gray-600">{initialData ? 'Edit Subject' : 'New Subject Entry'}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div><label className="block text-sm font-medium">Subject Name</label><input required name="name" value={formData.name} onChange={handleChange} className="block w-full border rounded p-2 mt-1 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium">Subject Code (Optional)</label><input name="code" value={formData.code} onChange={handleChange} className="block w-full border rounded p-2 mt-1 focus:ring-blue-500" /></div>

        <div className="flex justify-between items-center pt-6 border-t gap-4">
          <div className="flex gap-2">
            {initialData && <button type="button" onClick={() => onDelete?.(initialData.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded border border-red-200">Delete</button>}
            <button type="button" onClick={() => onPrint?.(formData)} className="px-4 py-2 bg-gray-50 text-gray-700 rounded border flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="px-6 py-2 border rounded text-gray-700">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-800 text-white rounded hover:bg-blue-900">{initialData ? 'Update' : 'Save'}</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SubjectForm;
import React, { useState, useEffect } from 'react';
import { Subject, LOGO_URL, SCHOOL_NAME } from '../types';
import { db } from '../services/storage';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Subject | null;
}

const SubjectForm: React.FC<Props> = ({ onSuccess, onCancel, initialData }) => {
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
    if (!formData.name) return;

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
        <h3 className="text-lg font-medium text-gray-600">
          {initialData ? 'Edit Subject' : 'Add New Subject'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Subject Name</label>
          <input 
            required 
            name="name" 
            value={formData.name}
            onChange={handleChange} 
            className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="e.g. Mathematics" 
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Subject Code (Optional)</label>
          <input 
            name="code" 
            value={formData.code}
            onChange={handleChange} 
            className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="e.g. MATH101" 
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
          <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e3a8a] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            {initialData ? 'Update Subject' : 'Save Subject'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubjectForm;
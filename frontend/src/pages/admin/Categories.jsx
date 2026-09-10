import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import api from '../../api/axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const load = () => api.get('/admin/categories').then((res) => setCategories(res.data.categories));

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!newName.trim()) return;
    try {
      await api.post('/admin/categories', { name: newName });
      setNewName('');
      toast.success('Category created');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create category');
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setEditingName(c.name);
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/categories/${id}`, { name: editingName });
      setEditingId(null);
      toast.success('Category updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>

      <div className="mb-6 flex gap-2">
        <input
          placeholder="New category (e.g. 'Web Development')"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && create()}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <button onClick={create} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Add
        </button>
      </div>

      <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
        {categories.map((c) => (
          <div key={c._id} className="flex items-center justify-between px-4 py-3">
            {editingId === c._id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
            ) : (
              <span>{c.name}</span>
            )}
            <div className="flex gap-2">
              {editingId === c._id ? (
                <>
                  <button onClick={() => saveEdit(c._id)}><Check size={16} className="text-green-600" /></button>
                  <button onClick={() => setEditingId(null)}><X size={16} className="text-gray-400" /></button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(c)}><Pencil size={15} className="text-gray-500" /></button>
                  <button onClick={() => remove(c._id)}><Trash2 size={15} className="text-red-500" /></button>
                </>
              )}
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="px-4 py-6 text-center text-gray-400">No categories yet</p>}
      </div>
    </div>
  );
};

export default Categories;

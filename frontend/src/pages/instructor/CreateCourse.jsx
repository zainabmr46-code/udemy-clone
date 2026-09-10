import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    level: 'beginner',
    language: 'English',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (thumbnail) formData.append('thumbnail', thumbnail);

      const { data } = await api.post('/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Course created — pending admin approval');
      navigate(`/instructor/courses/${data.course._id}/manage`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create course');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Create a new course</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Course title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-900"
        />
        <textarea
          required
          placeholder="Description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-900"
        />
        <select
          required
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-3">
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="Price (0 = free)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-900"
          />
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Thumbnail image</label>
          <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} />
        </div>
        <button
          disabled={busy}
          className="rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? 'Creating…' : 'Create course'}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;

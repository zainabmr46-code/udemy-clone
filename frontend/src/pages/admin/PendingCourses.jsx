import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const PendingCourses = () => {
  const [courses, setCourses] = useState([]);

  const load = () => api.get('/admin/courses/pending').then((res) => setCourses(res.data.courses));

  useEffect(() => {
    load();
  }, []);

  const decide = async (id, decision) => {
    try {
      await api.put(`/admin/courses/${id}/review`, { decision });
      toast.success(`Course ${decision}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Pending Course Approvals</h1>
      {courses.length === 0 ? (
        <p className="text-gray-500">Nothing pending review.</p>
      ) : (
        <div className="space-y-4">
          {courses.map((c) => (
            <div key={c._id} className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-500">
                  By {c.instructor?.name} &middot; {c.category?.name} &middot; ${c.price}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => decide(c._id, 'approved')} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                  Approve
                </button>
                <button onClick={() => decide(c._id, 'rejected')} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingCourses;

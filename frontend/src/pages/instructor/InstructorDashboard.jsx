import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api/axios';

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

const InstructorDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/instructor/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p className="mx-auto max-w-6xl px-4 py-16 text-gray-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
        <Link to="/instructor/create-course" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          + Create Course
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Courses" value={stats.totalCourses} />
        <StatCard label="Total Students" value={stats.totalStudents} />
        <StatCard label="Total Earnings" value={`$${stats.totalEarnings.toFixed(2)}`} />
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 p-5 dark:border-gray-800">
        <h2 className="mb-4 font-semibold">Revenue trend</h2>
        {stats.revenueTrend.length === 0 ? (
          <p className="text-sm text-gray-500">No revenue yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <h2 className="mb-3 mt-8 font-semibold">Your courses</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Students</th>
              <th className="px-4 py-2">Rating</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {stats.perCourse.map((c) => (
              <tr key={c._id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-2">{c.title}</td>
                <td className="px-4 py-2 capitalize">{c.status}</td>
                <td className="px-4 py-2">{c.students}</td>
                <td className="px-4 py-2">{c.rating}</td>
                <td className="px-4 py-2">${c.price}</td>
                <td className="px-4 py-2">
                  <Link to={`/instructor/courses/${c._id}/manage`} className="text-brand-600">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorDashboard;

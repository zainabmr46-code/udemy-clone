import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p className="mx-auto max-w-6xl px-4 py-16 text-gray-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Students" value={stats.totalStudents} />
        <StatCard label="Instructors" value={stats.totalInstructors} />
        <StatCard label="Courses" value={stats.totalCourses} />
        <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/pending-courses" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Pending Approvals ({stats.pendingApprovals})
        </Link>
        <Link to="/admin/users" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">
          Manage Users
        </Link>
        <Link to="/admin/categories" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">
          Categories
        </Link>
        <Link to="/admin/payouts" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">
          Payouts
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

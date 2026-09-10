import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const MyLearning = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/enrollments/my-learning')
      .then((res) => setEnrollments(res.data.enrollments))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-16 text-gray-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">My Learning</h1>
      {enrollments.length === 0 ? (
        <p className="text-gray-500">
          You haven't enrolled in anything yet. <Link to="/courses" className="text-brand-600">Browse courses</Link>.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <Link
              key={e._id}
              to={`/learn/${e.course._id}`}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                {e.course.thumbnail && <img src={e.course.thumbnail} alt="" className="h-full w-full object-cover" />}
              </div>
              <h3 className="mt-3 line-clamp-2 font-semibold">{e.course.title}</h3>
              <p className="text-sm text-gray-500">{e.course.instructor?.name}</p>
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div className="h-full bg-brand-600" style={{ width: `${e.progressPercent}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-500">{e.progressPercent}% complete</p>
              </div>
              {e.certificateIssued && (
                <a
                  href={`/api${e.certificateUrl.replace('/api', '')}`}
                  onClick={(ev) => ev.stopPropagation()}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-green-600"
                >
                  🎓 Download certificate
                </a>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLearning;

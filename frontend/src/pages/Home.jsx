import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';

const Home = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses?sort=rating&limit=8').then((res) => setCourses(res.data.courses)).catch(() => {});
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 to-brand-500 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Learn without limits</h1>
          <p className="mx-auto mt-4 max-w-xl text-brand-50">
            Courses in web dev, design, AI and more — taught by real instructors, at your own pace.
          </p>
          <Link
            to="/courses"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Browse Courses
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-bold">Top rated courses</h2>
        {courses.length === 0 ? (
          <p className="text-gray-500">
            No courses yet — sign up as an instructor and create the first one, then approve it from the admin dashboard.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((c) => (
              <CourseCard key={c._id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

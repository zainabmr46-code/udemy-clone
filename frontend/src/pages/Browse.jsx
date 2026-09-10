import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const level = searchParams.get('level') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/courses', { params: { keyword, category, level, sort } })
      .then((res) => {
        setCourses(res.data.courses);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, [keyword, category, level, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Browse Courses</h1>

      <div className="mb-8 flex flex-wrap gap-3">
        <input
          placeholder="Search courses…"
          defaultValue={keyword}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('keyword', e.target.value)}
          className="min-w-[220px] flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => updateParam('level', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">Newest</option>
          <option value="rating">Top rated</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">No courses match your filters.</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">{total} course(s) found</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((c) => (
              <CourseCard key={c._id} course={c} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Browse;

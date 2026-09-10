import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const CourseCard = ({ course }) => {
  return (
    <Link
      to={`/courses/${course._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">No thumbnail</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug">{course.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{course.instructor?.name}</p>
        <StarRating rating={course.rating || 0} size={13} />
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-brand-600 dark:text-brand-500">
            {course.price > 0 ? `$${course.price.toFixed(2)}` : 'Free'}
          </span>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-500">
            {course.level}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;

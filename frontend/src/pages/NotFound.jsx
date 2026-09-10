import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
    <h1 className="text-4xl font-bold">404</h1>
    <p className="mt-2 text-gray-500">Page not found.</p>
    <Link to="/" className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
      Go home
    </Link>
  </div>
);

export default NotFound;

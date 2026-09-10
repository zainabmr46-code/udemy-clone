import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dashboardLink =
    user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/instructor' : '/my-learning';

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand-700 dark:text-brand-500">
          <GraduationCap size={24} />
          <span>LearnHub</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/courses" className="text-sm font-medium hover:text-brand-600">
            Browse Courses
          </Link>
          {user && (
            <Link to={dashboardLink} className="text-sm font-medium hover:text-brand-600">
              Dashboard
            </Link>
          )}
          {user?.role === 'instructor' && (
            <Link to="/instructor/create-course" className="text-sm font-medium hover:text-brand-600">
              Create Course
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                )}
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-brand-600">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 px-4 py-3 md:hidden dark:border-gray-800">
          <div className="flex flex-col gap-3">
            <Link to="/courses" onClick={() => setOpen(false)}>Browse Courses</Link>
            {user ? (
              <>
                <Link to={dashboardLink} onClick={() => setOpen(false)}>Dashboard</Link>
                <Link to="/profile" onClick={() => setOpen(false)}>Profile</Link>
                <button
                  className="text-left"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate('/');
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/signup" onClick={() => setOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

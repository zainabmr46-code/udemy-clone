import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Usage: <ProtectedRoute roles={['instructor']}><InstructorDashboard /></ProtectedRoute>
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center py-24 text-gray-500">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;

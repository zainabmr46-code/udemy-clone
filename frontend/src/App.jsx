import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Browse from './pages/Browse';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import PaymentSuccess from './pages/PaymentSuccess';
import NotFound from './pages/NotFound';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

import MyLearning from './pages/student/MyLearning';
import CoursePlayer from './pages/student/CoursePlayer';

import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import ManageCourse from './pages/instructor/ManageCourse';

import AdminDashboard from './pages/admin/AdminDashboard';
import PendingCourses from './pages/admin/PendingCourses';
import ManageUsers from './pages/admin/ManageUsers';
import Categories from './pages/admin/Categories';
import Payouts from './pages/admin/Payouts';

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Browse />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* Any authenticated user */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Student */}
          <Route path="/my-learning" element={<ProtectedRoute roles={['student']}><MyLearning /></ProtectedRoute>} />
          <Route path="/learn/:courseId" element={<ProtectedRoute roles={['student']}><CoursePlayer /></ProtectedRoute>} />

          {/* Instructor */}
          <Route path="/instructor" element={<ProtectedRoute roles={['instructor']}><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor/create-course" element={<ProtectedRoute roles={['instructor']}><CreateCourse /></ProtectedRoute>} />
          <Route path="/instructor/courses/:courseId/manage" element={<ProtectedRoute roles={['instructor']}><ManageCourse /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/pending-courses" element={<ProtectedRoute roles={['admin']}><PendingCourses /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><Categories /></ProtectedRoute>} />
          <Route path="/admin/payouts" element={<ProtectedRoute roles={['admin']}><Payouts /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

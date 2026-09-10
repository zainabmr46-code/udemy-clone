const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');

// @desc  Instructor dashboard: total students, earnings, per-course analytics
// @route GET /api/instructor/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id });
  const courseIds = courses.map((c) => c._id);

  const totalStudents = courses.reduce((sum, c) => sum + c.studentsCount, 0);

  const payments = await Payment.find({ instructor: req.user._id, status: 'completed' });
  const totalEarnings = payments.reduce((sum, p) => sum + p.amount * 0.7, 0);

  // Monthly revenue trend (for Recharts on the frontend)
  const monthlyRevenue = {};
  payments.forEach((p) => {
    const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + p.amount * 0.7;
  });
  const revenueTrend = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }));

  const perCourse = courses.map((c) => ({
    _id: c._id,
    title: c.title,
    students: c.studentsCount,
    rating: c.rating,
    status: c.status,
    isPublished: c.isPublished,
    price: c.price,
  }));

  res.json({
    success: true,
    totalCourses: courses.length,
    totalStudents,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    revenueTrend,
    perCourse,
  });
});

// @desc  List students enrolled in a specific course + their progress
// @route GET /api/instructor/courses/:courseId/students
const getCourseStudents = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course || String(course.instructor) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }
  const enrollments = await Enrollment.find({ course: course._id }).populate('student', 'name email avatar');
  res.json({ success: true, count: enrollments.length, enrollments });
});

// @desc  List all courses owned by the logged-in instructor
// @route GET /api/instructor/courses
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).populate('category', 'name').sort('-createdAt');
  res.json({ success: true, courses });
});

module.exports = { getDashboard, getCourseStudents, getMyCourses };

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Category = require('../models/Category');

// @desc  Admin dashboard summary
// @route GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalInstructors = await User.countDocuments({ role: 'instructor' });
  const totalCourses = await Course.countDocuments();
  const pendingApprovals = await Course.countDocuments({ status: 'pending' });

  const payments = await Payment.find({ status: 'completed' });
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  res.json({
    success: true,
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    pendingApprovals,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
  });
});

// @desc  List courses pending approval
// @route GET /api/admin/courses/pending
const getPendingCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ status: 'pending' }).populate('instructor', 'name email').populate('category', 'name');
  res.json({ success: true, courses });
});

// @desc  Approve or reject a course
// @route PUT /api/admin/courses/:id/review
const reviewCourse = asyncHandler(async (req, res) => {
  const { decision } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(decision)) {
    res.status(400);
    throw new Error("decision must be 'approved' or 'rejected'");
  }
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  course.status = decision;
  if (decision === 'approved') course.isPublished = true;
  await course.save();
  res.json({ success: true, course });
});

// @desc  List all users (filter by role)
// @route GET /api/admin/users?role=
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).select('-password').sort('-createdAt');
  res.json({ success: true, count: users.length, users });
});

// @desc  Block/unblock a user
// @route PUT /api/admin/users/:id/block
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, user });
});

// @desc  CRUD Categories
// @route POST /api/admin/categories
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
  const category = await Category.create({ name, slug });
  res.status(201).json({ success: true, category });
});

// @route GET /api/admin/categories (public too, but kept here for CRUD symmetry)
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json({ success: true, categories });
});

// @route PUT /api/admin/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  category.name = req.body.name || category.name;
  category.slug = category.name.toLowerCase().trim().replace(/\s+/g, '-');
  await category.save();
  res.json({ success: true, category });
});

// @route DELETE /api/admin/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});

// @desc  Track instructor payouts, mark as paid
// @route GET /api/admin/payouts
const getPayouts = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: 'completed' }).populate('instructor', 'name email').populate('course', 'title');
  const byInstructor = {};
  payments.forEach((p) => {
    const key = String(p.instructor._id);
    if (!byInstructor[key]) {
      byInstructor[key] = { instructor: p.instructor, totalEarned: 0, unpaidAmount: 0, payments: [] };
    }
    const share = p.amount * 0.7;
    byInstructor[key].totalEarned += share;
    if (p.payoutStatus === 'unpaid') byInstructor[key].unpaidAmount += share;
    byInstructor[key].payments.push(p);
  });
  res.json({ success: true, payouts: Object.values(byInstructor) });
});

// @route PUT /api/admin/payouts/:paymentId/mark-paid
const markPayoutPaid = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.paymentId);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  payment.payoutStatus = 'paid';
  await payment.save();
  res.json({ success: true, payment });
});

module.exports = {
  getDashboard,
  getPendingCourses,
  reviewCourse,
  getUsers,
  toggleBlockUser,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getPayouts,
  markPayoutPaid,
};

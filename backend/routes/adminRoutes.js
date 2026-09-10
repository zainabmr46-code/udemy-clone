const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);

router.get('/courses/pending', getPendingCourses);
router.put('/courses/:id/review', reviewCourse);

router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/payouts', getPayouts);
router.put('/payouts/:paymentId/mark-paid', markPayoutPaid);

module.exports = router;

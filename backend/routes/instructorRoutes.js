const express = require('express');
const router = express.Router();
const { getDashboard, getCourseStudents, getMyCourses } = require('../controllers/instructorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('instructor'));

router.get('/dashboard', getDashboard);
router.get('/courses', getMyCourses);
router.get('/courses/:courseId/students', getCourseStudents);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addSection,
} = require('../controllers/courseController');
const { addReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../utils/cloudinary');

// Optional auth: attach req.user if a token is present, but don't block guests
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization || req.cookies?.token) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', getCourses);
router.get('/:id', optionalAuth, getCourseById);

router.post('/', protect, authorize('instructor'), uploadImage.single('thumbnail'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), uploadImage.single('thumbnail'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

router.post('/:id/sections', protect, authorize('instructor'), addSection);
router.post('/:courseId/reviews', protect, authorize('student'), addReview);

module.exports = router;

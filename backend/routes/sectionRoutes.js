const express = require('express');
const router = express.Router();
const { addLecture } = require('../controllers/courseController');
const { createQuiz, getQuiz, submitQuiz } = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');
const { uploadVideo } = require('../utils/cloudinary');

router.post('/:sectionId/lectures', protect, authorize('instructor'), uploadVideo.single('video'), addLecture);

router.post('/:sectionId/quiz', protect, authorize('instructor'), createQuiz);
router.get('/:sectionId/quiz', protect, getQuiz);
router.post('/:sectionId/quiz/submit', protect, authorize('student'), submitQuiz);

module.exports = router;

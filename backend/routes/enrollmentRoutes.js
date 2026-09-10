const express = require('express');
const router = express.Router();
const {
  enrollFree,
  getMyLearning,
  markLectureComplete,
  downloadCertificate,
  addNote,
  addBookmark,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my-learning', protect, authorize('student'), getMyLearning);
router.get('/certificate/:certId', protect, downloadCertificate);
router.post('/:courseId', protect, authorize('student'), enrollFree);
router.put('/:courseId/complete/:lectureId', protect, authorize('student'), markLectureComplete);
router.post('/:courseId/notes', protect, authorize('student'), addNote);
router.post('/:courseId/bookmarks', protect, authorize('student'), addBookmark);

module.exports = router;

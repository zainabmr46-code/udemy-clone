const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const recalcCourseRating = async (courseId) => {
  const reviews = await Review.find({ course: courseId });
  const numReviews = reviews.length;
  const rating = numReviews ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 0;
  await Course.findByIdAndUpdate(courseId, { rating: Math.round(rating * 10) / 10, numReviews });
};

// @desc  Add or update a review (must be enrolled)
// @route POST /api/courses/:courseId/reviews
const addReview = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { rating, comment } = req.body;

  const isEnrolled = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (!isEnrolled) {
    res.status(403);
    throw new Error('You must be enrolled in this course to leave a review');
  }

  let review = await Review.findOne({ course: courseId, student: req.user._id });
  if (review) {
    review.rating = rating;
    review.comment = comment;
    await review.save();
  } else {
    review = await Review.create({ course: courseId, student: req.user._id, rating, comment });
  }

  await recalcCourseRating(courseId);
  res.status(201).json({ success: true, review });
});

// @desc  Delete own review (or admin)
// @route DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (String(review.student) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  const courseId = review.course;
  await review.deleteOne();
  await recalcCourseRating(courseId);
  res.json({ success: true, message: 'Review deleted' });
});

module.exports = { addReview, deleteReview };

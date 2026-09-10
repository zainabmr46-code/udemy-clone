const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Payment = require('../models/Payment');
const sendEmail = require('../utils/sendEmail');
const generateCertificate = require('../utils/generateCertificate');

// @desc  Enroll in a FREE course directly (paid courses go through /api/payments/checkout)
// @route POST /api/enrollments/:courseId
const enrollFree = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course || course.status !== 'approved' || !course.isPublished) {
    res.status(404);
    throw new Error('Course not available');
  }
  if (course.price > 0) {
    res.status(400);
    throw new Error('This is a paid course. Use the checkout endpoint.');
  }

  const existing = await Enrollment.findOne({ student: req.user._id, course: course._id });
  if (existing) {
    res.status(400);
    throw new Error('Already enrolled');
  }

  const enrollment = await Enrollment.create({ student: req.user._id, course: course._id });
  course.studentsCount += 1;
  await course.save();

  await sendEmail({
    to: req.user.email,
    subject: `You're enrolled in ${course.title}!`,
    html: `<p>Hi ${req.user.name}, you're now enrolled in <b>${course.title}</b>. Happy learning!</p>`,
  });

  res.status(201).json({ success: true, enrollment });
});

// @desc  Get logged-in student's "My Learning" dashboard (all enrolled courses + % progress)
// @route GET /api/enrollments/my-learning
const getMyLearning = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate({
    path: 'course',
    populate: [{ path: 'instructor', select: 'name' }, { path: 'category', select: 'name' }],
  });
  res.json({ success: true, count: enrollments.length, enrollments });
});

// @desc  Mark a lecture as complete, recompute progress %, auto-issue certificate at 100%
// @route PUT /api/enrollments/:courseId/complete/:lectureId
const markLectureComplete = asyncHandler(async (req, res) => {
  const { courseId, lectureId } = req.params;
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  if (!enrollment.completedLectures.includes(lectureId)) {
    enrollment.completedLectures.push(lectureId);
  }

  const totalLectures = await Lecture.countDocuments({ course: courseId });
  enrollment.progressPercent = totalLectures
    ? Math.round((enrollment.completedLectures.length / totalLectures) * 100)
    : 0;

  // Auto-generate certificate at 100% completion
  if (enrollment.progressPercent >= 100 && !enrollment.certificateIssued) {
    const course = await Course.findById(courseId);
    const certId = `CERT-${courseId.slice(-6)}-${req.user._id.toString().slice(-6)}-${Date.now().toString(36)}`;
    await generateCertificate({
      studentName: req.user.name,
      courseTitle: course.title,
      date: new Date().toLocaleDateString(),
      certId,
    });
    enrollment.certificateIssued = true;
    enrollment.certificateUrl = `/api/enrollments/certificate/${certId}`;

    await sendEmail({
      to: req.user.email,
      subject: `🎉 You completed ${course.title}!`,
      html: `<p>Congrats ${req.user.name}! You've completed <b>${course.title}</b>. Your certificate is ready in your dashboard.</p>`,
    });
  }

  await enrollment.save();
  res.json({ success: true, enrollment });
});

// @desc  Download certificate PDF
// @route GET /api/enrollments/certificate/:certId
const downloadCertificate = asyncHandler(async (req, res) => {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(__dirname, '..', 'certificates', `${req.params.certId}.pdf`);
  if (!fs.existsSync(filePath)) {
    res.status(404);
    throw new Error('Certificate not found');
  }
  res.download(filePath);
});

// @desc  Add a note to a lecture (timestamped)
// @route POST /api/enrollments/:courseId/notes
const addNote = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }
  const { lectureId, timestamp, text } = req.body;
  enrollment.notes.push({ lecture: lectureId, timestamp, text });
  await enrollment.save();
  res.status(201).json({ success: true, notes: enrollment.notes });
});

// @desc  Add a bookmark (timestamp) to a lecture
// @route POST /api/enrollments/:courseId/bookmarks
const addBookmark = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }
  const { lectureId, timestamp, label } = req.body;
  enrollment.bookmarks.push({ lecture: lectureId, timestamp, label });
  await enrollment.save();
  res.status(201).json({ success: true, bookmarks: enrollment.bookmarks });
});

module.exports = {
  enrollFree,
  getMyLearning,
  markLectureComplete,
  downloadCertificate,
  addNote,
  addBookmark,
};

const asyncHandler = require('express-async-handler');
const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now().toString(36);

const Course = require('../models/Course');
const Section = require('../models/Section');
const Lecture = require('../models/Lecture');
const Review = require('../models/Review');
const Enrollment = require('../models/Enrollment');

// @desc  Browse/search/filter published+approved courses
// @route GET /api/courses?keyword=&category=&level=&minPrice=&maxPrice=&sort=
const getCourses = asyncHandler(async (req, res) => {
  const { keyword, category, level, minPrice, maxPrice, sort } = req.query;

  const filter = { isPublished: true, status: 'approved' };
  if (keyword) filter.$text = { $search: keyword };
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'rating') sortOption = { rating: -1 };

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const courses = await Course.find(filter)
    .populate('instructor', 'name avatar')
    .populate('category', 'name slug')
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Course.countDocuments(filter);

  res.json({ success: true, count: courses.length, total, page, pages: Math.ceil(total / limit), courses });
});

// @desc  Get single course with syllabus (sections + lectures, videoUrl hidden unless enrolled/preview)
// @route GET /api/courses/:id
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name avatar bio')
    .populate('category', 'name slug');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const sections = await Section.find({ course: course._id }).sort('order');
  const lectures = await Lecture.find({ course: course._id }).sort('order');

  let isEnrolled = false;
  if (req.user) {
    isEnrolled = !!(await Enrollment.findOne({ student: req.user._id, course: course._id }));
  }

  const syllabus = sections.map((section) => ({
    _id: section._id,
    title: section.title,
    order: section.order,
    lectures: lectures
      .filter((l) => String(l.section) === String(section._id))
      .map((l) => ({
        _id: l._id,
        title: l.title,
        duration: l.duration,
        isPreview: l.isPreview,
        // Only expose the actual video URL if enrolled, preview lecture, or owner/admin
        videoUrl:
          isEnrolled || l.isPreview || (req.user && (req.user.role === 'admin' || String(course.instructor) === String(req.user._id)))
            ? l.videoUrl
            : undefined,
      })),
  }));

  const reviews = await Review.find({ course: course._id }).populate('student', 'name avatar').sort('-createdAt');

  res.json({ success: true, course, syllabus, reviews, isEnrolled });
});

// @desc  Create a course (Instructor) — starts as 'pending' until admin approves
// @route POST /api/courses
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, price, level, language } = req.body;

  const course = await Course.create({
    title,
    slug: slugify(title),
    description,
    category,
    price: price || 0,
    level,
    language,
    instructor: req.user._id,
    thumbnail: req.file ? req.file.path : '',
    status: 'pending',
    isPublished: false,
  });

  res.status(201).json({ success: true, course });
});

// @desc  Update course (Instructor owner or Admin)
// @route PUT /api/courses/:id
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this course');
  }

  const fields = ['title', 'description', 'category', 'price', 'level', 'language', 'isPublished'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) course[f] = req.body[f];
  });
  if (req.file) course.thumbnail = req.file.path;

  // Editing a course after approval sends it back for re-review
  if (req.user.role !== 'admin') course.status = 'pending';

  const updated = await course.save();
  res.json({ success: true, course: updated });
});

// @desc  Delete course (Instructor owner or Admin)
// @route DELETE /api/courses/:id
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this course');
  }
  await Section.deleteMany({ course: course._id });
  await Lecture.deleteMany({ course: course._id });
  await course.deleteOne();
  res.json({ success: true, message: 'Course deleted' });
});

// @desc  Add a section to a course (Instructor owner)
// @route POST /api/courses/:id/sections
const addSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (String(course.instructor) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }
  const count = await Section.countDocuments({ course: course._id });
  const section = await Section.create({ course: course._id, title: req.body.title, order: count });
  res.status(201).json({ success: true, section });
});

// @desc  Add a lecture (video) to a section (Instructor owner)
// @route POST /api/sections/:sectionId/lectures
const addLecture = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.sectionId);
  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }
  const course = await Course.findById(section.course);
  if (String(course.instructor) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('Video file is required (field name: video)');
  }

  const count = await Lecture.countDocuments({ section: section._id });
  const lecture = await Lecture.create({
    section: section._id,
    course: course._id,
    title: req.body.title,
    videoUrl: req.file.path,
    videoPublicId: req.file.filename,
    duration: req.body.duration || 0,
    order: count,
    isPreview: req.body.isPreview === 'true',
  });

  res.status(201).json({ success: true, lecture });
});

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addSection,
  addLecture,
};

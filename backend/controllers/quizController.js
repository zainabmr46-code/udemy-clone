const asyncHandler = require('express-async-handler');
const Quiz = require('../models/Quiz');
const Section = require('../models/Section');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc  Create/replace quiz for a section (Instructor owner)
// @route POST /api/sections/:sectionId/quiz
const createQuiz = asyncHandler(async (req, res) => {
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

  const { title, questions } = req.body; // questions: [{question, options[], correctOptionIndex}]

  let quiz = await Quiz.findOne({ section: section._id });
  if (quiz) {
    quiz.title = title || quiz.title;
    quiz.questions = questions;
    await quiz.save();
  } else {
    quiz = await Quiz.create({ section: section._id, course: course._id, title, questions });
  }

  res.status(201).json({ success: true, quiz });
});

// @desc  Get quiz for a section (options only, correct answers hidden unless owner)
// @route GET /api/sections/:sectionId/quiz
const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ section: req.params.sectionId });
  if (!quiz) {
    res.status(404);
    throw new Error('No quiz for this section');
  }
  const sanitized = {
    _id: quiz._id,
    title: quiz.title,
    questions: quiz.questions.map((q) => ({ _id: q._id, question: q.question, options: q.options })),
  };
  res.json({ success: true, quiz: sanitized });
});

// @desc  Submit quiz answers (Student, must be enrolled)
// @route POST /api/sections/:sectionId/quiz/submit
const submitQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ section: req.params.sectionId });
  if (!quiz) {
    res.status(404);
    throw new Error('No quiz for this section');
  }
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: quiz.course });
  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled to take this quiz');
  }

  const { answers } = req.body; // [{questionId, selectedIndex}]
  let score = 0;
  quiz.questions.forEach((q) => {
    const ans = answers.find((a) => a.questionId === String(q._id));
    if (ans && ans.selectedIndex === q.correctOptionIndex) score += 1;
  });

  enrollment.quizResults = enrollment.quizResults.filter((r) => String(r.quiz) !== String(quiz._id));
  enrollment.quizResults.push({ quiz: quiz._id, score, total: quiz.questions.length, passedAt: new Date() });
  await enrollment.save();

  res.json({ success: true, score, total: quiz.questions.length });
});

module.exports = { createQuiz, getQuiz, submitQuiz };

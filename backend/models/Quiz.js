const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true, validate: (v) => v.length >= 2 },
  correctOptionIndex: { type: Number, required: true },
});

const quizSchema = new mongoose.Schema(
  {
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, default: 'Section Quiz' },
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);

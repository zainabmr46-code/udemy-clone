const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
  timestamp: { type: Number, default: 0 }, // seconds into video
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const bookmarkSchema = new mongoose.Schema({
  lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
  timestamp: { type: Number, required: true },
  label: { type: String, default: '' },
});

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
    progressPercent: { type: Number, default: 0 },
    notes: [noteSchema],
    bookmarks: [bookmarkSchema],
    quizResults: [
      {
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        score: Number,
        total: Number,
        passedAt: Date,
      },
    ],
    certificateIssued: { type: Boolean, default: false },
    certificateUrl: { type: String, default: '' },
    purchasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

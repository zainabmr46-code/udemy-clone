const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
  {
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true }, // Cloudinary secure signed URL
    videoPublicId: { type: String }, // for signed URL regeneration / deletion
    duration: { type: Number, default: 0 }, // seconds
    order: { type: Number, default: 0 },
    isPreview: { type: Boolean, default: false }, // watchable without enrolling
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lecture', lectureSchema);

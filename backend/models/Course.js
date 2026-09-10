const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnail: { type: String, default: '' },
    previewVideo: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, default: 0 }, // 0 = free course
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    language: { type: String, default: 'English' },
    // Approval workflow (Admin)
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isPublished: { type: Boolean, default: false },
    // Aggregated / cached stats (updated on review/enrollment changes)
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    studentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);

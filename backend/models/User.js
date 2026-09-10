const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false }, // not required -> allows Google OAuth users
    googleId: { type: String },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    isBlocked: { type: Boolean, default: false },
    // Instructor-specific
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

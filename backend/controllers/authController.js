const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendAuthResponse = (res, user) => {
  const token = generateToken(user._id, user.role);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
    },
  });
};

// @desc  Register (student or instructor)
// @route POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: ['student', 'instructor'].includes(role) ? role : 'student',
  });

  sendAuthResponse(res, user);
});

// @desc  Login with email/password
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Contact support.');
  }

  sendAuthResponse(res, user);
});

// @desc  Login/Signup with Google OAuth (frontend sends Google ID token)
// @route POST /api/auth/google
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400);
    throw new Error('Google idToken is required');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      googleId: payload.sub,
      avatar: payload.picture,
      role: 'student',
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    await user.save();
  }

  sendAuthResponse(res, user);
});

// @desc  Get logged in user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @desc  Update profile (name, bio, avatar via Cloudinary upload)
// @route PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name || user.name;
  user.bio = req.body.bio ?? user.bio;
  if (req.file) {
    user.avatar = req.file.path; // Cloudinary URL from multer-storage-cloudinary
  }
  const updated = await user.save();
  res.json({ success: true, user: updated });
});

// @desc  Logout (clear cookie)
// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});

module.exports = { signup, login, googleAuth, getMe, updateProfile, logout };

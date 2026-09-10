const express = require('express');
const router = express.Router();
const { signup, login, googleAuth, getMe, updateProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../utils/cloudinary');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadImage.single('avatar'), updateProfile);

module.exports = router;

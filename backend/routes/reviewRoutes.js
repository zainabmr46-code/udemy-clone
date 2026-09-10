const express = require('express');
const router = express.Router();
const { deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.delete('/:id', protect, deleteReview);

module.exports = router;

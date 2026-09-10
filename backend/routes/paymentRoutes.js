const express = require('express');
const router = express.Router();
const { createCheckoutSession, getMyPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// NOTE: the raw webhook route is mounted separately in server.js (needs raw body, not JSON-parsed)
router.post('/checkout/:courseId', protect, authorize('student'), createCheckoutSession);
router.get('/my-payments', protect, getMyPayments);

module.exports = router;

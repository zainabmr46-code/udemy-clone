const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const sendEmail = require('../utils/sendEmail');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// @desc  Create a Stripe Checkout session for a paid course
// @route POST /api/payments/checkout/:courseId
const createCheckoutSession = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course || course.status !== 'approved') {
    res.status(404);
    throw new Error('Course not available');
  }

  const existing = await Enrollment.findOne({ student: req.user._id, course: course._id });
  if (existing) {
    res.status(400);
    throw new Error('Already enrolled');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: course.title },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/courses/${course._id}`,
    metadata: {
      studentId: String(req.user._id),
      courseId: String(course._id),
      instructorId: String(course.instructor),
    },
  });

  await Payment.create({
    student: req.user._id,
    course: course._id,
    instructor: course.instructor,
    amount: course.price,
    provider: 'stripe',
    providerPaymentId: session.id,
    status: 'pending',
  });

  res.json({ success: true, url: session.url, sessionId: session.id });
});

// @desc  Stripe webhook — confirms payment, creates enrollment, credits instructor earnings
// @route POST /api/payments/webhook
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { studentId, courseId, instructorId } = session.metadata;

    const payment = await Payment.findOne({ providerPaymentId: session.id });
    if (payment && payment.status !== 'completed') {
      payment.status = 'completed';
      await payment.save();

      await Enrollment.create({ student: studentId, course: courseId });
      await Course.findByIdAndUpdate(courseId, { $inc: { studentsCount: 1 } });

      const User = require('../models/User');
      await User.findByIdAndUpdate(instructorId, { $inc: { earnings: payment.amount * 0.7 } }); // 70% to instructor

      const student = await User.findById(studentId);
      const course = await Course.findById(courseId);
      await sendEmail({
        to: student.email,
        subject: `Payment confirmed — welcome to ${course.title}!`,
        html: `<p>Thanks for your purchase! You're now enrolled in <b>${course.title}</b>.</p>`,
      });
    }
  }

  res.json({ received: true });
});

// @desc  Get logged-in user's payment history
// @route GET /api/payments/my-payments
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ student: req.user._id }).populate('course', 'title thumbnail');
  res.json({ success: true, payments });
});

module.exports = { createCheckoutSession, stripeWebhook, getMyPayments };

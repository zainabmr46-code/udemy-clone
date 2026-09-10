const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    provider: { type: String, enum: ['stripe', 'razorpay', 'free'], default: 'stripe' },
    providerPaymentId: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    payoutStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

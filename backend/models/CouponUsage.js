const mongoose = require('mongoose');

const couponUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // Adjust ref if needed
  usedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CouponUsage', couponUsageSchema);

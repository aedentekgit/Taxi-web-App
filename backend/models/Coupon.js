const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true },
  title:         { type: String, required: true },
  discountType:  { type: String, enum: ['percentage','flat'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount:   { type: Number },
  minOrderValue: { type: Number, default: 0 },
  serviceType:   { type: String, enum: ['all','cab','intercity','rental'], default: 'all' },
  usageLimit:    { type: Number },
  usedCount:     { type: Number, default: 0 },
  perUserLimit:  { type: Number, default: null },
  firstRideOnly: { type: Boolean, default: false },
  userType:      { type: String, enum: ['new', 'existing', 'all'], default: 'all' },
  validFrom:     { type: Date, default: Date.now },
  timeWindow: {
    start: { type: String }, // "HH:mm"
    end: { type: String }
  },
  city:          { type: String, default: null },
  paymentMethod: { type: String, enum: ['online', 'cash', null], default: null },
  validUntil:    { type: Date, required: true },
  isActive:      { type: Boolean, default: true },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

module.exports = mongoose.model('Coupon', couponSchema);

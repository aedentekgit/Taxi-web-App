const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, unique: true, sparse: true, lowercase: true },
  phone:       { type: String, required: true, unique: true },
  city:        { type: String, default: 'Mumbai' },
  walletBalance: { type: Number, default: 0 },
  totalRides:  { type: Number, default: 0 },
  totalSpent:  { type: Number, default: 0 },
  status:      { type: String, enum: ['active','blocked'], default: 'active' },
  fcmToken:    { type: String },
  profilePic:  { type: String },
  referralCode:{ type: String, unique: true, sparse: true },
  referredBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
}, { timestamps: true });

customerSchema.index({ phone: 1 });
customerSchema.index({ status: 1 });

module.exports = mongoose.model('Customer', customerSchema);

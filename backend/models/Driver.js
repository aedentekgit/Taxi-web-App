const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, unique: true, sparse: true, lowercase: true },
  phone:         { type: String, required: true, unique: true },
  vehicleNumber: { type: String, required: true, uppercase: true },
  vehicleType:   { type: String, enum: ['sedan','suv','auto','bike'], default: 'sedan' },
  vehicleModel:  { type: String },
  zone:          { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
  rating:        { type: Number, default: 0, min: 0, max: 5 },
  totalRides:    { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  isOnline:      { type: Boolean, default: false },
  status:        { type: String, enum: ['pending','approved','rejected','blocked'], default: 'pending' },
  documents: {
    license:  { url: String, verified: { type: Boolean, default: false } },
    rc:       { url: String, verified: { type: Boolean, default: false } },
    insurance:{ url: String, verified: { type: Boolean, default: false } },
    aadhar:   { url: String, verified: { type: Boolean, default: false } },
    pan:      { url: String, verified: { type: Boolean, default: false } },
  },
  subscription:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  fcmToken:      { type: String },
  currentLocation: { lat: Number, lng: Number },
}, { timestamps: true });

driverSchema.index({ status: 1 });
driverSchema.index({ isOnline: 1 });

module.exports = mongoose.model('Driver', driverSchema);

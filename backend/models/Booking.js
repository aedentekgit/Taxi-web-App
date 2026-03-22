const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId:   { type: String, unique: true },
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  driver:      { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  vehicleType: { type: String, enum: ['sedan','suv','auto','bike'], required: true },
  pickup:      { address: String, lat: Number, lng: Number },
  drop:        { address: String, lat: Number, lng: Number },
  stops:       [{ address: String, lat: Number, lng: Number }],
  distance:    { type: Number }, // km
  duration:    { type: Number }, // minutes
  fare:        { type: Number },
  commission:  { type: Number }, // admin cut
  driverEarning:{ type: Number },
  paymentMethod:{ type: String, enum: ['cash','wallet','upi','card'], default: 'cash' },
  paymentStatus:{ type: String, enum: ['pending','paid','refunded'], default: 'pending' },
  status:      { type: String, enum: ['pending','accepted','started','completed','cancelled'], default: 'pending' },
  otp:         { type: String },
  cancelReason:{ type: String },
  cancelledBy: { type: String, enum: ['customer','driver','admin'] },
  rating:      { customer: Number, driver: Number },
  couponApplied:{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  discount:    { type: Number, default: 0 },
  zone:        { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
}, { timestamps: true });

bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now().toString().slice(-8) + Math.floor(Math.random()*100);
  }
  next();
});

bookingSchema.index({ status: 1 });
bookingSchema.index({ customer: 1 });
bookingSchema.index({ driver: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);

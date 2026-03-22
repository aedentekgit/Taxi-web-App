const mongoose = require('mongoose');

const intercitySchema = new mongoose.Schema({
  bookingId:    { type: String, unique: true },
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  driver:       { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  vehicleType:  { type: String, enum: ['sedan','suv'], default: 'sedan' },
  fromCity:     { type: String, required: true },
  toCity:       { type: String, required: true },
  tripType:     { type: String, enum: ['one_way','round_trip'], default: 'one_way' },
  scheduledAt:  { type: Date, required: true },
  returnDate:   { type: Date },
  distance:     { type: Number },
  fare:         { type: Number },
  commission:   { type: Number },
  driverEarning:{ type: Number },
  paymentMethod:{ type: String, enum: ['cash','wallet','upi','card'], default: 'cash' },
  paymentStatus:{ type: String, enum: ['pending','paid','refunded'], default: 'pending' },
  status:       { type: String, enum: ['pending','confirmed','started','completed','cancelled'], default: 'pending' },
  cancelReason: { type: String },
  couponApplied:{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  discount:     { type: Number, default: 0 },
}, { timestamps: true });

intercitySchema.pre('save', function(next) {
  if (!this.bookingId) this.bookingId = 'IC' + Date.now().toString().slice(-8) + Math.floor(Math.random()*100);
  next();
});

module.exports = mongoose.model('IntercityBooking', intercitySchema);

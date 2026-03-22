const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  bookingId:      { type: String, unique: true },
  customer:       { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  driver:         { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  packageName:    { type: String, required: true }, // e.g. "4Hr/40Km Sedan"
  hours:          { type: Number, required: true },
  includedKms:    { type: Number, required: true },
  vehicleType:    { type: String, enum: ['sedan','suv','auto'], default: 'sedan' },
  startLocation:  { address: String, lat: Number, lng: Number },
  baseFare:       { type: Number },
  extraKms:       { type: Number, default: 0 },
  extraKmCharge:  { type: Number, default: 0 },
  extraHours:     { type: Number, default: 0 },
  extraHourCharge:{ type: Number, default: 0 },
  totalFare:      { type: Number },
  commission:     { type: Number },
  driverEarning:  { type: Number },
  paymentMethod:  { type: String, enum: ['cash','wallet','upi','card'], default: 'cash' },
  paymentStatus:  { type: String, enum: ['pending','paid','refunded'], default: 'pending' },
  status:         { type: String, enum: ['pending','accepted','started','completed','cancelled'], default: 'pending' },
  startedAt:      { type: Date },
  completedAt:    { type: Date },
  couponApplied:  { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  discount:       { type: Number, default: 0 },
}, { timestamps: true });

rentalSchema.pre('save', function(next) {
  if (!this.bookingId) this.bookingId = 'RN' + Date.now().toString().slice(-8) + Math.floor(Math.random()*100);
  next();
});

module.exports = mongoose.model('RentalBooking', rentalSchema);

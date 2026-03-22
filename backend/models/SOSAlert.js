const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  alertId:   { type: String, unique: true },
  raisedBy:  { type: String, enum: ['customer','driver'], required: true },
  customer:  { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  driver:    { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  booking:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  location:  { address: String, lat: Number, lng: Number },
  status:    { type: String, enum: ['active','acknowledged','resolved'], default: 'active' },
  acknowledgedAt: { type: Date },
  resolvedAt:     { type: Date },
  resolvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:     { type: String },
}, { timestamps: true });

sosSchema.pre('save', function(next) {
  if (!this.alertId) this.alertId = 'SOS' + Date.now().toString().slice(-8) + Math.floor(Math.random()*100);
  next();
});

module.exports = mongoose.model('SOSAlert', sosSchema);

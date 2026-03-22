const mongoose = require('mongoose');

const driverIncentiveSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  description:   { type: String },
  incentiveType: { type: String, enum: ['ride_count', 'earnings', 'peak_hours', 'acceptance_rate'], required: true },
  targetValue:   { type: Number, required: true },
  rewardAmount:  { type: Number, required: true },
  rewardType:    { type: String, enum: ['fixed', 'per_ride'], default: 'fixed' },
  startDate:     { type: Date, required: true },
  endDate:       { type: Date, required: true },
  timeWindow:    {
    start:       { type: String }, // "HH:mm"
    end:         { type: String }
  },
  city:          { type: String, default: null },
  vehicleType:   { type: String, enum: ['sedan', 'suv', 'auto', 'bike', null], default: null },
  isActive:      { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DriverIncentive', driverIncentiveSchema);

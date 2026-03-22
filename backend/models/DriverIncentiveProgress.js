const mongoose = require('mongoose');

const driverIncentiveProgressSchema = new mongoose.Schema({
  driverId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  incentiveId:    { type: mongoose.Schema.Types.ObjectId, ref: 'DriverIncentive', required: true },
  completedValue: { type: Number, default: 0 },
  isCompleted:    { type: Boolean, default: false },
  rewardGiven:    { type: Boolean, default: false },
  lastUpdated:    { type: Date, default: Date.now }
});

driverIncentiveProgressSchema.index({ driverId: 1, incentiveId: 1 }, { unique: true });

module.exports = mongoose.model('DriverIncentiveProgress', driverIncentiveProgressSchema);

const mongoose = require('mongoose');

const driverWalletTransactionSchema = new mongoose.Schema({
  amount:    { type: Number, required: true },
  type:      { type: String, enum: ['credit', 'debit'], required: true },
  reason:    { type: String, enum: ['incentive', 'ride', 'withdrawal', 'adjustment'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const driverWalletSchema = new mongoose.Schema({
  driverId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, unique: true },
  balance:      { type: Number, default: 0 },
  transactions: [driverWalletTransactionSchema]
}, { timestamps: true });

module.exports = mongoose.model('DriverWallet', driverWalletSchema);

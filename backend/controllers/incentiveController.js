const DriverIncentive = require('../models/DriverIncentive');
const DriverIncentiveProgress = require('../models/DriverIncentiveProgress');
const DriverWallet = require('../models/DriverWallet');
const mongoose = require('mongoose');

// ==========================================
// ADMIN ROUTES
// ==========================================

exports.create = async (req, res, next) => {
  try {
    const incentive = await DriverIncentive.create(req.body);
    res.status(201).json({ success: true, data: incentive });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const incentive = await DriverIncentive.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!incentive) return res.status(404).json({ success: false, message: 'Incentive not found' });
    res.json({ success: true, data: incentive });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [incentives, total] = await Promise.all([
      DriverIncentive.find().sort({ _id: 1 }).skip(skip).limit(limit),
      DriverIncentive.countDocuments(),
    ]);
    res.json({ success: true, data: incentives, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const incentive = await DriverIncentive.findById(req.params.id);
    if (!incentive) return res.status(404).json({ success: false, message: 'Incentive not found' });
    incentive.isActive = !incentive.isActive;
    await incentive.save();
    res.json({ success: true, data: incentive });
  } catch (err) {
    next(err);
  }
};

exports.getProgressByDriver = async (req, res, next) => {
  try {
    const progress = await DriverIncentiveProgress.find({ driverId: req.params.driverId })
      .populate('incentiveId');
    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// DRIVER ROUTES
// ==========================================

exports.getActiveForDriver = async (req, res, next) => {
  try {
    const now = new Date();
    // In real app, filter by driver's city & vehicleType
    const incentives = await DriverIncentive.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    // Also attach progress
    const progresses = await DriverIncentiveProgress.find({
      driverId: req.user._id,
      incentiveId: { $in: incentives.map(i => i._id) }
    });

    const data = incentives.map(inc => {
      const prog = progresses.find(p => p.incentiveId.equals(inc._id));
      return { incentive: inc, progress: prog || null };
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// Internal API Triggered by Ride Completion
exports.processRideIncentive = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { driverId, fare, city, vehicleType } = req.body;
    const now = new Date();

    const activeIncentives = await DriverIncentive.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [{ city: city || null }, { city: null }],
      $or: [{ vehicleType }, { vehicleType: null }]
    }).session(session);

    for (let inc of activeIncentives) {
      if (inc.timeWindow && inc.timeWindow.start && inc.timeWindow.end) {
        const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        if (timeStr < inc.timeWindow.start || timeStr > inc.timeWindow.end) continue;
      }

      let increment = 0;
      if (inc.incentiveType === 'ride_count' || inc.incentiveType === 'peak_hours') increment = 1;
      if (inc.incentiveType === 'earnings') increment = fare || 0;

      let progress = await DriverIncentiveProgress.findOne({ driverId, incentiveId: inc._id }).session(session);
      if (!progress) {
        progress = new DriverIncentiveProgress({ driverId, incentiveId: inc._id });
      }

      if (!progress.isCompleted) {
        progress.completedValue += increment;
        progress.lastUpdated = new Date();

        if (inc.rewardType === 'per_ride') {
          await creditWallet(driverId, inc.rewardAmount, 'incentive', inc.title, session);
          if (progress.completedValue >= inc.targetValue) {
             progress.isCompleted = true;
             progress.rewardGiven = true;
          }
        } 
        else if (progress.completedValue >= inc.targetValue) {
          progress.isCompleted = true;
          progress.rewardGiven = true;
          await creditWallet(driverId, inc.rewardAmount, 'incentive', inc.title, session);
        }

        await progress.save({ session });
      }
    }

    await session.commitTransaction();
    res.json({ success: true, message: 'Progress updated' });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

async function creditWallet(driverId, amount, reason, title, session) {
  let wallet = await DriverWallet.findOne({ driverId }).session(session);
  if (!wallet) wallet = new DriverWallet({ driverId, balance: 0, transactions: [] });
  wallet.balance += amount;
  wallet.transactions.push({ amount, type: 'credit', reason, createdAt: new Date() });
  await wallet.save({ session });
}

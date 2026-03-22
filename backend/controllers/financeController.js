const Booking = require('../models/Booking');
const IntercityBooking = require('../models/IntercityBooking');
const RentalBooking = require('../models/RentalBooking');
const Driver = require('../models/Driver');

const getDateRange = (period) => {
  const now = new Date();
  const from = new Date();
  if (period === '7d')  from.setDate(now.getDate() - 7);
  if (period === '30d') from.setDate(now.getDate() - 30);
  if (period === '90d') from.setDate(now.getDate() - 90);
  if (period === '1y')  from.setFullYear(now.getFullYear() - 1);
  return { $gte: from, $lte: now };
};

// GET /api/finance/summary
exports.getSummary = async (req, res, next) => {
  try {
    const period = req.query.period || '30d';
    const dateRange = getDateRange(period);

    const [cabAgg, intercityAgg, rentalAgg, paymentMethodAgg] = await Promise.all([
      Booking.aggregate([
        { $match: { status: 'completed', createdAt: dateRange } },
        { $group: { _id: '$paymentMethod', total: { $sum: '$fare' }, commission: { $sum: '$commission' }, count: { $sum: 1 } } },
      ]),
      IntercityBooking.aggregate([
        { $match: { status: 'completed', createdAt: dateRange } },
        { $group: { _id: null, total: { $sum: '$fare' }, commission: { $sum: '$commission' }, count: { $sum: 1 } } },
      ]),
      RentalBooking.aggregate([
        { $match: { status: 'completed', createdAt: dateRange } },
        { $group: { _id: null, total: { $sum: '$totalFare' }, commission: { $sum: '$commission' }, count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { status: 'completed', createdAt: dateRange } },
        { $group: { _id: '$paymentMethod', total: { $sum: '$fare' }, count: { $sum: 1 } } },
      ]),
    ]);

    const sumAll = (agg) => agg.reduce((a, b) => ({ total: a.total + (b.total||0), commission: a.commission + (b.commission||0), count: a.count + (b.count||0) }), { total: 0, commission: 0, count: 0 });
    const cabTotals = sumAll(cabAgg);
    const allTotals = {
      total: cabTotals.total + (intercityAgg[0]?.total||0) + (rentalAgg[0]?.totalFare||0),
      commission: cabTotals.commission + (intercityAgg[0]?.commission||0) + (rentalAgg[0]?.commission||0),
      count: cabTotals.count + (intercityAgg[0]?.count||0) + (rentalAgg[0]?.count||0),
    };

    res.json({
      success: true,
      data: {
        totalRevenue: allTotals.total,
        adminEarnings: allTotals.commission,
        driverEarnings: allTotals.total - allTotals.commission,
        completedRides: allTotals.count,
        paymentBreakdown: paymentMethodAgg,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/finance/top-drivers
exports.getTopDrivers = async (req, res, next) => {
  try {
    const period = req.query.period || '30d';
    const dateRange = getDateRange(period);
    const limit = parseInt(req.query.limit) || 10;

    const topDrivers = await Booking.aggregate([
      { $match: { status: 'completed', createdAt: dateRange } },
      { $group: { _id: '$driver', totalEarnings: { $sum: '$driverEarning' }, totalRides: { $sum: 1 } } },
      { $sort: { totalEarnings: -1 } },
      { $limit: limit },
      { $lookup: { from: 'drivers', localField: '_id', foreignField: '_id', as: 'driver' } },
      { $unwind: '$driver' },
      { $project: { name: '$driver.name', phone: '$driver.phone', totalEarnings: 1, totalRides: 1 } },
    ]);

    res.json({ success: true, data: topDrivers });
  } catch (err) { next(err); }
};

// GET /api/finance/revenue-trend
exports.getRevenueTrend = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const trend = await Booking.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: since } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$fare' },
        commission: { $sum: '$commission' },
        rides: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: trend });
  } catch (err) { next(err); }
};

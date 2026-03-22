const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const IntercityBooking = require('../models/IntercityBooking');
const RentalBooking = require('../models/RentalBooking');
const SOSAlert = require('../models/SOSAlert');

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalCustomers, activeCustomers,
      totalDrivers, onlineDrivers, pendingDrivers,
      totalRides, activeRides,
      activeSOS,
      revenueAgg,
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: 'active' }),
      Driver.countDocuments({ status: 'approved' }),
      Driver.countDocuments({ isOnline: true }),
      Driver.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: { $in: ['completed','started'] } }),
      Booking.countDocuments({ status: 'started' }),
      SOSAlert.countDocuments({ status: 'active' }),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fare' }, commission: { $sum: '$commission' } } },
      ]),
    ]);

    const revenue = revenueAgg[0] || { total: 0, commission: 0 };

    res.json({
      success: true,
      data: {
        totalCustomers, activeCustomers,
        totalDrivers, onlineDrivers, pendingDrivers,
        totalRides, activeRides,
        activeSOS,
        totalRevenue: revenue.total,
        adminEarnings: revenue.commission,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/dashboard/revenue-chart
exports.getRevenueChart = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const data = await Booking.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: since } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$fare' },
          commission: { $sum: '$commission' },
          rides: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/recent-bookings
exports.getRecentBookings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const bookings = await Booking.find()
      .sort({ _id: 1 })
      .limit(limit)
      .populate('customer', 'name phone')
      .populate('driver', 'name phone');

    res.json({ success: true, data: bookings });
  } catch (err) { next(err); }
};

// GET /api/dashboard/ride-type-distribution
exports.getRideDistribution = async (req, res, next) => {
  try {
    const [cab, intercity, rental] = await Promise.all([
      Booking.countDocuments({ status: 'completed' }),
      IntercityBooking.countDocuments({ status: 'completed' }),
      RentalBooking.countDocuments({ status: 'completed' }),
    ]);
    const total = cab + intercity + rental || 1;
    res.json({
      success: true,
      data: { cab, intercity, rental, total,
        percentages: {
          cab: +((cab/total)*100).toFixed(1),
          intercity: +((intercity/total)*100).toFixed(1),
          rental: +((rental/total)*100).toFixed(1),
        }
      },
    });
  } catch (err) { next(err); }
};

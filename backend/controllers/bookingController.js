const Booking = require('../models/Booking');

const buildFilter = async (query) => {
  const filter = {};
  if (query.status)  filter.status = query.status;
  if (query.payment) filter.paymentMethod = query.payment;
  if (query.vehicle) filter.vehicleType = query.vehicle;
  if (query.from && query.to) filter.createdAt = { $gte: new Date(query.from), $lte: new Date(query.to) };

  if (query.search) {
    const searchRegex = { $regex: query.search, $options: 'i' };
    const Customer = require('../models/Customer');
    const Driver = require('../models/Driver');
    
    const [customers, drivers] = await Promise.all([
      Customer.find({ $or: [{ name: searchRegex }, { phone: searchRegex }, { email: searchRegex }] }).select('_id'),
      Driver.find({ $or: [{ name: searchRegex }, { phone: searchRegex }, { email: searchRegex }, { vehiclePlate: searchRegex }, { vehicleModel: searchRegex }] }).select('_id')
    ]);

    filter.$or = [
      { bookingId: searchRegex },
      { customer: { $in: customers.map(c => c._id) } },
      { driver: { $in: drivers.map(d => d._id) } },
      { vehicleType: searchRegex },
      { paymentMethod: searchRegex },
      { paymentStatus: searchRegex },
      { status: searchRegex },
      { 'pickup.address': searchRegex },
      { 'drop.address': searchRegex }
    ];

    const parsedNum = Number(query.search);
    if (!isNaN(parsedNum)) {
      filter.$or.push({ fare: parsedNum });
      filter.$or.push({ commission: parsedNum });
    }
  }
  return filter;
};

// GET /api/bookings
exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    const filter = await buildFilter(req.query);

    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort({ _id: 1 }).skip(skip).limit(limit)
        .populate('customer', 'name phone')
        .populate('driver', 'name phone vehicleNumber'),
      Booking.countDocuments(filter),
    ]);

    res.json({ success: true, data: bookings, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/bookings/:id
exports.getOne = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('driver', 'name phone vehicleNumber vehicleType rating');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// POST /api/bookings
exports.create = async (req, res, next) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// PUT /api/bookings/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, cancelReason } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, ...(cancelReason && { cancelReason, cancelledBy: 'admin' }) },
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// DELETE /api/bookings/:id
exports.remove = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) { next(err); }
};

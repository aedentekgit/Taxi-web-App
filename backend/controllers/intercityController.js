const IntercityBooking = require('../models/IntercityBooking');

const buildFilter = async (q) => {
  const f = {};
  if (q.status)   f.status = q.status;
  if (q.tripType) f.tripType = q.tripType;
  if (q.from && q.to) f.createdAt = { $gte: new Date(q.from), $lte: new Date(q.to) };

  if (q.search) {
    const searchRegex = { $regex: q.search, $options: 'i' };
    const Customer = require('../models/Customer');
    const Driver = require('../models/Driver');
    
    const [customers, drivers] = await Promise.all([
      Customer.find({ $or: [{ name: searchRegex }, { phone: searchRegex }, { email: searchRegex }] }).select('_id'),
      Driver.find({ $or: [{ name: searchRegex }, { phone: searchRegex }, { email: searchRegex }, { vehiclePlate: searchRegex }, { vehicleModel: searchRegex }] }).select('_id')
    ]);

    f.$or = [
      { bookingId: searchRegex },
      { customer: { $in: customers.map(c => c._id) } },
      { driver: { $in: drivers.map(d => d._id) } },
      { 'from.city': searchRegex },
      { 'to.city': searchRegex },
      { 'from.address': searchRegex },
      { 'to.address': searchRegex },
      { vehicleType: searchRegex },
      { tripType: searchRegex },
      { paymentMethod: searchRegex },
      { paymentStatus: searchRegex },
      { status: searchRegex }
    ];

    const parsedNum = Number(q.search);
    if (!isNaN(parsedNum)) {
      f.$or.push({ fare: parsedNum }, { commission: parsedNum }, { distance: parsedNum });
    }
  }
  return f;
};

exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, +req.query.page || 1);
    const limit = Math.min(100, +req.query.limit || 20);
    const filter = await buildFilter(req.query);
    const [data, total] = await Promise.all([
      IntercityBooking.find(filter).sort({ _id: 1 }).skip((page-1)*limit).limit(limit)
        .populate('customer', 'name phone').populate('driver', 'name phone vehicleNumber'),
      IntercityBooking.countDocuments(filter),
    ]);
    res.json({ success: true, data, total, page, limit, pages: Math.ceil(total/limit) });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const doc = await IntercityBooking.findById(req.params.id)
      .populate('customer', 'name phone email').populate('driver', 'name phone vehicleNumber');
    if (!doc) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const doc = await IntercityBooking.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const doc = await IntercityBooking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await IntercityBooking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) { next(err); }
};

const RentalBooking = require('../models/RentalBooking');

exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, +req.query.page || 1);
    const limit = Math.min(100, +req.query.limit || 20);
    const filter = {};
    if (req.query.status)  filter.status = req.query.status;
    if (req.query.vehicle) filter.vehicleType = req.query.vehicle;
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
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
        { status: searchRegex }
      ];
      
      const parsedNum = Number(req.query.search);
      if (!isNaN(parsedNum)) {
        filter.$or.push({ fare: parsedNum }, { commission: parsedNum }, { packageHours: parsedNum }, { packageKm: parsedNum });
      }
    }
    const [data, total] = await Promise.all([
      RentalBooking.find(filter).sort({ _id: 1 }).skip((page-1)*limit).limit(limit)
        .populate('customer', 'name phone').populate('driver', 'name phone vehicleNumber'),
      RentalBooking.countDocuments(filter),
    ]);
    res.json({ success: true, data, total, page, limit, pages: Math.ceil(total/limit) });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const doc = await RentalBooking.findById(req.params.id)
      .populate('customer', 'name phone email').populate('driver', 'name phone vehicleNumber');
    if (!doc) return res.status(404).json({ success: false, message: 'Rental not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const doc = await RentalBooking.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const update = { status: req.body.status };
    if (req.body.status === 'started')   update.startedAt = new Date();
    if (req.body.status === 'completed') update.completedAt = new Date();
    const doc = await RentalBooking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Rental not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await RentalBooking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Rental deleted' });
  } catch (err) { next(err); }
};

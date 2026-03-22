const Driver = require('../models/Driver');
const Booking = require('../models/Booking');

// GET /api/drivers
exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.online)  filter.isOnline = req.query.online === 'true';
    if (req.query.zone)    filter.zone = req.query.zone;
    if (req.query.search) {
      const s = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { name: s }, { phone: s }, { vehicleNumber: s },
        { email: s }, { vehicleType: s }, { vehicleModel: s }, { status: s }
      ];
    }
    const [drivers, total] = await Promise.all([
      Driver.find(filter).sort({ _id: 1 }).skip(skip).limit(limit),
      Driver.countDocuments(filter),
    ]);
    res.json({ success: true, data: drivers, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/drivers/pending
exports.getPending = async (req, res, next) => {
  try {
    const drivers = await Driver.find({ status: 'pending' }).sort({ _id: 1 });
    res.json({ success: true, data: drivers, total: drivers.length });
  } catch (err) { next(err); }
};

// GET /api/drivers/:id
exports.getOne = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    const recentRides = await Booking.find({ driver: req.params.id })
      .sort({ _id: 1 }).limit(5)
      .populate('customer', 'name phone');
    res.json({ success: true, data: driver, recentRides });
  } catch (err) { next(err); }
};

// POST /api/drivers
exports.create = async (req, res, next) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (err) { next(err); }
};

// PUT /api/drivers/:id
exports.update = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};

// PUT /api/drivers/:id/approve
exports.approve = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver, message: 'Driver approved successfully' });
  } catch (err) { next(err); }
};

// PUT /api/drivers/:id/reject
exports.reject = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id, { status: 'rejected' }, { new: true }
    );
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver, message: 'Driver rejected' });
  } catch (err) { next(err); }
};

// PUT /api/drivers/:id/toggle-block
exports.toggleBlock = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    driver.status = driver.status === 'approved' ? 'blocked' : 'approved';
    await driver.save();
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};

// DELETE /api/drivers/:id
exports.remove = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, message: 'Driver deleted' });
  } catch (err) { next(err); }
};

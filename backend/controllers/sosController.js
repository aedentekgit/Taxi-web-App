const SOSAlert = require('../models/SOSAlert');

exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [alerts, total] = await Promise.all([
      SOSAlert.find(filter).sort({ _id: 1 })
        .populate('customer', 'name phone')
        .populate('driver', 'name phone')
        .populate('booking', 'bookingId')
        .populate('resolvedBy', 'name')
        .skip(skip).limit(limit),
      SOSAlert.countDocuments(filter),
    ]);
    res.json({ success: true, data: alerts, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const alert = await SOSAlert.findById(req.params.id)
      .populate('customer', 'name phone')
      .populate('driver', 'name phone')
      .populate('booking');
    if (!alert) return res.status(404).json({ success: false, message: 'SOS alert not found' });
    res.json({ success: true, data: alert });
  } catch (err) { next(err); }
};

exports.acknowledge = async (req, res, next) => {
  try {
    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.id,
      { status: 'acknowledged', acknowledgedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'SOS alert not found' });
    res.json({ success: true, data: alert, message: 'SOS acknowledged' });
  } catch (err) { next(err); }
};

exports.resolve = async (req, res, next) => {
  try {
    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date(), resolvedBy: req.user._id, notes: req.body.notes },
      { new: true }
    ).populate('resolvedBy', 'name');
    if (!alert) return res.status(404).json({ success: false, message: 'SOS alert not found' });
    res.json({ success: true, data: alert, message: 'SOS resolved' });
  } catch (err) { next(err); }
};

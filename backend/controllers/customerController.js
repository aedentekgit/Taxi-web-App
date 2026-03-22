const Customer = require('../models/Customer');
const Booking = require('../models/Booking');

// GET /api/customers
exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const s = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { name: s }, { phone: s }, { email: s },
        { status: s }, { referralCode: s }
      ];
    }
    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ _id: 1 }).skip(skip).limit(limit),
      Customer.countDocuments(filter),
    ]);
    res.json({ success: true, data: customers, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/customers/:id
exports.getOne = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    // Also get booking history
    const recentBookings = await Booking.find({ customer: req.params.id })
      .sort({ _id: 1 }).limit(5)
      .populate('driver', 'name vehicleNumber');
    res.json({ success: true, data: customer, recentBookings });
  } catch (err) { next(err); }
};

// POST /api/customers
exports.create = async (req, res, next) => {
  try {
    if (!req.body.referralCode) {
      req.body.referralCode = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) { next(err); }
};

// PUT /api/customers/:id
exports.update = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) { next(err); }
};

// PUT /api/customers/:id/toggle-status
exports.toggleStatus = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    customer.status = customer.status === 'active' ? 'blocked' : 'active';
    await customer.save();
    res.json({ success: true, data: customer, message: `Customer ${customer.status === 'active' ? 'unblocked' : 'blocked'}` });
  } catch (err) { next(err); }
};

// DELETE /api/customers/:id
exports.remove = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) { next(err); }
};

// PUT /api/customers/:id/wallet
exports.updateWallet = async (req, res, next) => {
  try {
    const { amount, type } = req.body; // type: 'credit' | 'debit'
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    if (type === 'debit' && customer.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }
    customer.walletBalance += type === 'credit' ? amount : -amount;
    await customer.save();
    res.json({ success: true, data: customer });
  } catch (err) { next(err); }
};

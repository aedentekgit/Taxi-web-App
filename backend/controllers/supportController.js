const SupportTicket = require('../models/SupportTicket');

// GET /api/support
exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.raisedBy) filter.raisedBy = req.query.raisedBy;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const s = { $regex: req.query.search, $options: 'i' };
      const Customer = require('../models/Customer');
      const Driver = require('../models/Driver');
      
      const [customers, drivers] = await Promise.all([
        Customer.find({ $or: [{ name: s }, { phone: s }, { email: s }] }).select('_id'),
        Driver.find({ $or: [{ name: s }, { phone: s }, { email: s }, { vehiclePlate: s }] }).select('_id')
      ]);

      filter.$or = [
        { ticketId: s },
        { subject: s },
        { message: s },
        { status: s },
        { priority: s },
        { customer: { $in: customers.map(c => c._id) } },
        { driver: { $in: drivers.map(d => d._id) } }
      ];
    }
    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter).sort({ _id: 1 }).skip(skip).limit(limit)
        .populate('customer', 'name phone')
        .populate('driver',   'name phone')
        .populate('assignedTo', 'name'),
      SupportTicket.countDocuments(filter),
    ]);
    res.json({ success: true, data: tickets, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/support/:id
exports.getOne = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('driver', 'name phone')
      .populate('assignedTo', 'name email');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

// PUT /api/support/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'resolved') update.resolvedAt = new Date();
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

// POST /api/support/:id/reply
exports.addReply = async (req, res, next) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: { from: 'admin', message, sentBy: req.user._id } }, status: 'in_progress' },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

// PUT /api/support/:id/assign
exports.assign = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id, { assignedTo: req.body.userId, status: 'in_progress' }, { new: true }
    ).populate('assignedTo', 'name');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

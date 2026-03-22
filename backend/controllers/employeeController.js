const User = require('../models/User');

// GET /api/employees
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role)   filter.role = req.query.role;
    if (req.query.status) filter.isActive = req.query.status === 'active';
    if (req.query.search) {
      const s = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { name: s }, { email: s }, { phone: s }, { role: s }
      ];
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments(filter);
    const employees = await User.find(filter)
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit);

    res.json({ 
      success: true, 
      data: employees, 
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (err) { next(err); }
};

// GET /api/employees/:id
exports.getOne = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: employee });
  } catch (err) { next(err); }
};

// POST /api/employees
exports.create = async (req, res, next) => {
  try {
    const employee = await User.create(req.body);
    const out = employee.toObject();
    delete out.password;
    res.status(201).json({ success: true, data: out });
  } catch (err) { next(err); }
};

// PUT /api/employees/:id
exports.update = async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;
    const employee = await User.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: employee });
  } catch (err) { next(err); }
};

// PUT /api/employees/:id/toggle-status
exports.toggleStatus = async (req, res, next) => {
  try {
    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    if (emp.role === 'superadmin') return res.status(403).json({ success: false, message: 'Cannot disable superadmin' });
    emp.isActive = !emp.isActive;
    await emp.save();
    res.json({ success: true, data: emp, message: `Employee ${emp.isActive ? 'enabled' : 'disabled'}` });
  } catch (err) { next(err); }
};

// DELETE /api/employees/:id
exports.remove = async (req, res, next) => {
  try {
    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    if (emp.role === 'superadmin') return res.status(403).json({ success: false, message: 'Cannot delete superadmin' });
    await emp.deleteOne();
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) { next(err); }
};

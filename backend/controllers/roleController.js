const Role = require('../models/Role');

// GET /api/roles
exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.isActive = req.query.status === 'active';
    if (req.query.search) {
      const s = { $regex: req.query.search, $options: 'i' };
      filter.$or = [{ name: s }, { description: s }];
    }
    const [roles, total] = await Promise.all([
      Role.find(filter).sort({ _id: 1 }).skip(skip).limit(limit),
      Role.countDocuments(filter),
    ]);
    res.json({ success: true, data: roles, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/roles/:id
exports.getOne = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, data: role });
  } catch (err) { next(err); }
};

// POST /api/roles
exports.create = async (req, res, next) => {
  try {
    const exists = await Role.findOne({ name: req.body.name });
    if (exists) return res.status(400).json({ success: false, message: 'Role already exists' });
    const role = await Role.create(req.body);
    res.status(201).json({ success: true, data: role });
  } catch (err) { next(err); }
};

// PUT /api/roles/:id
exports.update = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, data: role });
  } catch (err) { next(err); }
};

// PUT /api/roles/:id/toggle-status
exports.toggleStatus = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    role.isActive = !role.isActive;
    await role.save();
    res.json({ success: true, data: role, message: `Role ${role.isActive ? 'enabled' : 'disabled'}` });
  } catch (err) { next(err); }
};

// DELETE /api/roles/:id
exports.remove = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    await role.deleteOne();
    res.json({ success: true, message: 'Role deleted' });
  } catch (err) { next(err); }
};

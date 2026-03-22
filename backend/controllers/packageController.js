const Package = require('../models/Package');

exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    
    const filter = {};
    if (req.query.search) {
      const s = { $regex: req.query.search, $options: 'i' };
      filter.$or = [{ title: s }, { location: s }, { slug: s }];
    }

    const [packages, total] = await Promise.all([
      Package.find(filter).sort({ _id: 1 }).skip(skip).limit(limit),
      Package.countDocuments(filter),
    ]);

    res.json({ success: true, data: packages, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, data: pkg });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    let slug = req.body.slug;
    if (!slug && req.body.title) {
        slug = req.body.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    const pkg = await Package.create({ ...req.body, slug });
    res.status(201).json({ success: true, data: pkg });
  } catch (err) { 
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'A package with this title/slug already exists' });
    next(err); 
  }
};

exports.update = async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, data: pkg });
  } catch (err) { 
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'A package with this title/slug already exists' });
    next(err); 
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    pkg.isActive = !pkg.isActive;
    await pkg.save();
    res.json({ success: true, data: pkg, message: `Package ${pkg.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (err) { next(err); }
};

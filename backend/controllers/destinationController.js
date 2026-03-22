const Destination = require('../models/Destination');

exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      const s = { $regex: req.query.search, $options: 'i' };
      filter.$or = [{ name: s }, { country: s }, { slug: s }];
    }
    const [destinations, total] = await Promise.all([
      Destination.find(filter).sort({ _id: 1 }).skip(skip).limit(limit),
      Destination.countDocuments(filter),
    ]);
    res.json({ success: true, data: destinations, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Error fetching destinations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(destination);
  } catch (err) {
    console.error('Error fetching destination:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res, next) => {
  try {
    let slug = req.body.slug;
    if (!slug && req.body.name) {
        slug = req.body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    const payload = { ...req.body, slug };
    const destination = await Destination.create(payload);
    res.status(201).json({ message: 'Destination created', data: destination });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Slug already exists' });
    console.error('Error creating destination:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!destination) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Updated successfully', data: destination });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Slug already exists' });
    console.error('Error updating destination:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    let isActive = req.body.isActive;
    if (typeof req.body.isActive === 'undefined' && typeof req.body.status !== 'undefined') {
        isActive = req.body.status;
    }

    const doc = await Destination.findById(req.params.id);
    if(!doc) return res.status(404).json({message: 'Not found'});

    doc.isActive = isActive !== undefined ? isActive : !doc.isActive;
    await doc.save();
    res.status(200).json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res, next) => {
  try {
    const doc = await Destination.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting destination:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

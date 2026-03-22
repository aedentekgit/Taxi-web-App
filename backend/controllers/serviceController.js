const Service = require('../models/Service');

exports.getAllServices = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }
    const [services, total] = await Promise.all([
      Service.find(filter).sort({ _id: 1 }).skip(skip).limit(limit),
      Service.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, data: services, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ message: 'Server error fetching services' });
  }
};

exports.getServiceById = async (req, res, next) => {
  try {
    const idOrSlug = req.params.id;
    let service;
    // Check if valid ObjectId, else search by slug
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      service = await Service.findById(idOrSlug);
    } 
    if (!service) {
      service = await Service.findOne({ slug: idOrSlug });
    }
    
    if (!service) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(service);
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createService = async (req, res, next) => {
  try {
    let slug = req.body.slug;
    if (!slug && req.body.title) {
        slug = req.body.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    const payload = { ...req.body, slug };
    const service = await Service.create(payload);
    res.status(201).json({ message: 'Created successfully', data: service });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Slug already exists' });
    console.error('Error creating service:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateService = async (req, res, next) => {
  try {
    let slug = req.body.slug;
    if (!slug && req.body.title) {
        slug = req.body.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    const payload = { ...req.body, slug };
    const service = await Service.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    
    if (!service) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Updated successfully', data: service });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Slug already exists' });
    console.error('Error updating service:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    let isActive = req.body.isActive;
    if (typeof req.body.isActive === 'undefined' && typeof req.body.status !== 'undefined') {
        isActive = req.body.status;
    }

    const doc = await Service.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    doc.isActive = isActive !== undefined ? isActive : !doc.isActive;
    await doc.save();
    res.status(200).json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const doc = await Service.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

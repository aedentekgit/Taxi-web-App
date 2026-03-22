const Pricing = require('../models/Pricing');

let pricingCache = null;

const getCachedPricing = async () => {
  if (!pricingCache) {
    pricingCache = await Pricing.find().sort({ createdAt: 1 });
  }
  return pricingCache;
};

const invalidateCache = () => {
  pricingCache = null;
};

exports.getAllPricing = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.vehicle_type = { $regex: req.query.search, $options: 'i' };
    }

    // Since we now have filters, we might bypass the simple cache or extend it.
    // Given pricing lists are typically small, simple DB query is fine for consistency.
    const [results, total] = await Promise.all([
      Pricing.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit),
      Pricing.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, data: results, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createPricing = async (req, res) => {
  try {
    let payload = { ...req.body };
    if (req.file) { payload.icon = req.file.path; } // If using multer/cloudinary

    // The frontend may send booleans as strings
    if (payload.day_rent_single === 'true' || payload.day_rent_single === true) payload.day_rent_single = true;
    else payload.day_rent_single = false;

    if (payload.day_rent_round === 'false' || payload.day_rent_round === false) payload.day_rent_round = false;
    else payload.day_rent_round = true;

    // Numerical conversions handled automatically by mongoose, but good to ensure defaults:
    payload.day_rent = payload.day_rent || 0;
    payload.status = payload.status !== undefined ? parseInt(payload.status) : 1;
    
    const newPricing = await Pricing.create(payload);
    invalidateCache();

    // Optional: Notify frontend if using Socket.io
    const io = req.app.get('socketio');
    if (io) io.emit('pricingUpdate');

    res.status(201).json({ message: 'Pricing added successfully', data: newPricing });
  } catch (err) {
    res.status(500).json({ message: 'Server error adding pricing', error: err.message });
  }
};

exports.updatePricing = async (req, res) => {
  try {
    const { id } = req.params;
    let payload = { ...req.body };

    if (req.file) { payload.icon = req.file.path; }

    if (payload.day_rent_single !== undefined) {
      payload.day_rent_single = (payload.day_rent_single === 'true' || payload.day_rent_single === true);
    }
    if (payload.day_rent_round !== undefined) {
      payload.day_rent_round = (payload.day_rent_round === 'true' || payload.day_rent_round === true);
    }
    if (payload.status !== undefined) {
      payload.status = parseInt(payload.status);
    }

    const updated = await Pricing.findByIdAndUpdate(id, payload, { new: true });
    
    if (!updated) {
       return res.status(404).json({ message: 'Pricing not found' });
    }

    invalidateCache();
    res.status(200).json({ message: 'Pricing updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating pricing', error: err.message });
  }
};

exports.deletePricing = async (req, res) => {
  try {
    const { id } = req.params;
    await Pricing.findByIdAndDelete(id);
    invalidateCache();
    res.status(200).json({ message: 'Pricing deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting pricing' });
  }
};

exports.updatePricingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await Pricing.findByIdAndUpdate(id, { status: parseInt(status) });
    invalidateCache();
    res.status(200).json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

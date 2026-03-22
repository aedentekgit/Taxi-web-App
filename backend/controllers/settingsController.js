const AppSettings = require('../models/AppSettings');

const CATEGORIES = ['general','ride','referral','payment','legal','push','mail','mobile_otp','otp','app_config'];

// Helper: mask secret values in responses
function maskDoc(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj.isSecret && obj.value) obj.value = '••••••••••••';
  return obj;
}

// GET /api/settings — all settings grouped by category
exports.getAll = async (req, res, next) => {
  try {
    const docs = await AppSettings.find().sort({ category: 1, key: 1 });
    // Auto-seed if empty
    if (docs.length === 0) {
      await AppSettings.seed();
      return exports.getAll(req, res, next);
    }
    const grouped = {};
    CATEGORIES.forEach(c => (grouped[c] = []));
    docs.forEach(d => {
      if (grouped[d.category]) grouped[d.category].push(maskDoc(d));
    });
    res.json({ success: true, data: grouped });
  } catch (err) { next(err); }
};

// GET /api/settings/:category — settings for one category (flat key:value map)
exports.getByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    if (!CATEGORIES.includes(category))
      return res.status(400).json({ success: false, message: 'Invalid category' });
    const docs = await AppSettings.find({ category }).sort({ key: 1 });
    const flat = {};
    docs.forEach(d => { flat[d.key] = (d.isSecret && d.value) ? '••••••••••••' : d.value; });
    res.json({ success: true, data: flat, meta: docs.map(maskDoc) });
  } catch (err) { next(err); }
};

// GET /api/settings/key/:key — single setting
exports.getByKey = async (req, res, next) => {
  try {
    const doc = await AppSettings.findOne({ key: req.params.key });
    if (!doc) return res.status(404).json({ success: false, message: 'Setting not found' });
    res.json({ success: true, data: maskDoc(doc) });
  } catch (err) { next(err); }
};

// PUT /api/settings/:category — bulk update all fields in a category
exports.updateCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    if (!CATEGORIES.includes(category))
      return res.status(400).json({ success: false, message: 'Invalid category' });
    const updates = req.body; // { key: value, ... }
    let count = 0;
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string' && value.includes('••••')) continue; // skip masked
      await AppSettings.findOneAndUpdate(
        { key, category },
        { value, updatedBy: req.user?._id },
        { new: true, upsert: true }
      );
      count++;
    }
    res.json({ success: true, message: `${category} settings saved`, count });
  } catch (err) { next(err); }
};

// PUT /api/settings/key/:key — update single setting value
exports.update = async (req, res, next) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];
    for (const { key, value } of updates) {
      if (typeof value === 'string' && value.includes('••••')) continue;
      const doc = await AppSettings.findOneAndUpdate(
        { key },
        { value, updatedBy: req.user?._id },
        { new: true, upsert: true }
      );
      results.push(maskDoc(doc));
    }
    res.json({ success: true, data: results, message: 'Settings updated' });
  } catch (err) { next(err); }
};

exports.updateKey = async (req, res, next) => {
  try {
    const { value } = req.body;
    if (value === undefined)
      return res.status(400).json({ success: false, message: 'value is required' });
    if (typeof value === 'string' && value.includes('••••'))
      return res.json({ success: true, message: 'Secret unchanged' });
    const doc = await AppSettings.findOneAndUpdate(
      { key: req.params.key },
      { value, updatedBy: req.user?._id },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Setting not found' });
    res.json({ success: true, data: maskDoc(doc) });
  } catch (err) { next(err); }
};

// POST /api/settings — create a new custom setting
exports.create = async (req, res, next) => {
  try {
    const { key, value, category, label, description, dataType, options, isSecret } = req.body;
    if (!key || value === undefined || !category)
      return res.status(400).json({ success: false, message: 'key, value and category required' });
    const existing = await AppSettings.findOne({ key });
    if (existing)
      return res.status(409).json({ success: false, message: 'Setting key already exists' });
    const doc = await AppSettings.create({
      key, value, category, label, description, dataType, options, isSecret,
      updatedBy: req.user?._id
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// DELETE /api/settings/key/:key
exports.deleteKey = async (req, res, next) => {
  try {
    const doc = await AppSettings.findOneAndDelete({ key: req.params.key });
    if (!doc) return res.status(404).json({ success: false, message: 'Setting not found' });
    res.json({ success: true, message: 'Setting deleted' });
  } catch (err) { next(err); }
};

// POST /api/settings/seed — seed all defaults (superadmin only)
exports.seed = async (req, res, next) => {
  try {
    await AppSettings.seed();
    res.json({ success: true, message: 'Default settings seeded successfully' });
  } catch (err) { next(err); }
};

// GET /api/settings/public — non-secret general+app_config (no auth needed)
exports.getPublic = async (req, res, next) => {
  try {
    const docs = await AppSettings.find({
      isSecret: { $ne: true },
      category: { $in: ['general', 'app_config'] }
    });
    const result = {};
    docs.forEach(d => { result[d.key] = d.value; });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

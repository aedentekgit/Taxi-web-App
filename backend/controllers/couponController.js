const Coupon = require('../models/Coupon');

exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    const filter = {};
    if (req.query.status === 'active')  filter.isActive = true;
    if (req.query.status === 'expired') filter.validUntil = { $lt: new Date() };
    if (req.query.service) filter.serviceType = req.query.service;
    if (req.query.search) {
      const s = { $regex: req.query.search, $options: 'i' };
      filter.$or = [{ code: s }, { title: s }, { discountType: s }, { serviceType: s }];
      const parsedNum = Number(req.query.search);
      if (!isNaN(parsedNum)) {
        filter.$or.push({ discountValue: parsedNum }, { maxDiscount: parsedNum }, { minOrderValue: parsedNum });
      }
    }
    const [coupons, total] = await Promise.all([
      Coupon.find(filter).sort({ _id: 1 }).skip(skip).limit(limit).populate('createdBy', 'name'),
      Coupon.countDocuments(filter),
    ]);
    res.json({ success: true, data: coupons, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: coupon });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, data: coupon });
  } catch (err) { next(err); }
};

// POST /api/coupons/validate
exports.validate = async (req, res, next) => {
  try {
    const { code, orderValue, orderAmount, serviceType, userId, city, paymentMethod } = req.body;
    const amount = orderValue || orderAmount || 0;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) return res.status(400).json({ success: false, message: 'Coupon is not active yet' });
    if (coupon.validUntil && now > coupon.validUntil) return res.status(400).json({ success: false, message: 'Coupon has expired' });
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    
    if (coupon.serviceType !== 'all' && serviceType && coupon.serviceType !== serviceType) {
      return res.status(400).json({ success: false, message: `Coupon valid for ${coupon.serviceType} only` });
    }
    
    if (amount < coupon.minOrderValue) {
      return res.status(400).json({ success: false, message: `Minimum order value ₹${coupon.minOrderValue} required` });
    }
    
    if (coupon.city && city && coupon.city.toLowerCase() !== city.toLowerCase()) {
      return res.status(400).json({ success: false, message: `Coupon valid only in ${coupon.city}` });
    }
    
    if (coupon.paymentMethod && paymentMethod && coupon.paymentMethod !== paymentMethod) {
      return res.status(400).json({ success: false, message: `Coupon valid only for ${coupon.paymentMethod} payments` });
    }
    
    if (coupon.timeWindow && coupon.timeWindow.start && coupon.timeWindow.end) {
      const currentHourMatch = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      if (currentHourMatch < coupon.timeWindow.start || currentHourMatch > coupon.timeWindow.end) {
        return res.status(400).json({ success: false, message: `Coupon valid only between ${coupon.timeWindow.start} and ${coupon.timeWindow.end}` });
      }
    }
    
    if (userId) {
      const userCompletedRides = await require('../models/Booking').countDocuments({ customer: userId, status: 'completed' });
      
      if (coupon.firstRideOnly && userCompletedRides > 0) {
        return res.status(400).json({ success: false, message: 'Coupon valid for first ride only' });
      }
      
      if (coupon.userType === 'new' && userCompletedRides > 0) {
        return res.status(400).json({ success: false, message: 'Coupon valid for new users only' });
      }
      
      if (coupon.userType === 'existing' && userCompletedRides === 0) {
        return res.status(400).json({ success: false, message: 'Coupon valid for existing users only' });
      }
      
      if (coupon.perUserLimit) {
        const userUsageCount = await require('../models/CouponUsage').countDocuments({ userId, couponId: coupon._id });
        if (userUsageCount >= coupon.perUserLimit) {
          return res.status(400).json({ success: false, message: `Coupon usage limit of ${coupon.perUserLimit} per user reached` });
        }
      }
    }

    let discount = coupon.discountType === 'percentage' ? (amount * coupon.discountValue) / 100 : coupon.discountValue;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    res.json({ 
      success: true, 
      data: {
        ...coupon.toObject(),
        discountAmount: Math.round(discount),
        finalAmount: Math.round(Math.max(0, amount - discount))
      }, 
      discount: Math.round(discount) 
    });
  } catch (err) { next(err); }
};

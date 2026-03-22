const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role'); // Import Role model

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userDoc = await User.findById(decoded.id).select('-password');
    if (!userDoc) return res.status(401).json({ success: false, message: 'User not found' });
    
    // Convert to plain object to attach custom properties
    req.user = userDoc.toObject();

    let permissions = [];
    if (req.user.role === 'superadmin') {
      permissions = ['all'];
    } else {
      const roleDoc = await Role.findOne({ name: req.user.role });
      if (roleDoc && roleDoc.isActive) {
        permissions = roleDoc.permissions || [];
      }
    }
    req.user.permissions = permissions;
    
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized` });
  }
  next();
};

const authorizePage = (pageName) => (req, res, next) => {
  if (req.user.role === 'superadmin' || (req.user.permissions && req.user.permissions.includes(pageName))) {
    return next();
  }
  return res.status(403).json({ success: false, message: `Access to '${pageName}' denied` });
};

module.exports = { protect, authorize, authorizePage };

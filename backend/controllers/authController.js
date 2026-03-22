const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const Role = require('../models/Role'); // Import Role module

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt: ${email}`);
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    console.log('Finding user...');
    const user = await User.findOne({ email }).select('+password');
    console.log(`User found: ${user ? 'yes' : 'no'}`);
    if (!user || !(await user.matchPassword(password))) {
      console.log('Invalid credentials');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      console.log('Account disabled');
      return res.status(403).json({ success: false, message: 'Account is disabled' });
    }

    console.log('Updating lastLogin...');
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Fetch permissions
    let permissions = [];
    if (user.role === 'superadmin') {
      permissions = ['all'];
    } else {
      const roleDoc = await Role.findOne({ name: user.role });
      if (roleDoc && roleDoc.isActive) permissions = roleDoc.permissions || [];
    }

    console.log('Signing token...');
    const token = signToken(user._id);
    console.log('Token signed. Responding...');
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, permissions },
    });
  } catch (err) { 
    console.error('Login error:', err);
    next(err); 
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

// POST /api/auth/logout (client just deletes token, but we can blacklist if needed)
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

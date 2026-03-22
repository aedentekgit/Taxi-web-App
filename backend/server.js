require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes         = require('./routes/auth');
const dashboardRoutes    = require('./routes/dashboard');
const bookingRoutes      = require('./routes/bookings');
const intercityRoutes    = require('./routes/intercity');
const rentalRoutes       = require('./routes/rental');
const customerRoutes     = require('./routes/customers');
const driverRoutes       = require('./routes/drivers');
const employeeRoutes     = require('./routes/employees');
const financeRoutes      = require('./routes/finance');
const supportRoutes      = require('./routes/support');
const sosRoutes          = require('./routes/sos');
const couponRoutes       = require('./routes/coupons');
const incentiveRoutes    = require('./routes/incentives');
const packageRoutes      = require('./routes/packages');
const rentalPackageRoutes= require('./routes/rental-packages');
const destinationsRoutes = require('./routes/destinations');
const serviceRoutes      = require('./routes/services');
const uploadRoutes       = require('./routes/upload');
const settingsRoutes     = require('./routes/settings');
const roleRoutes         = require('./routes/roles');
const pricingRoutes      = require('./routes/pricing');

// Connect to MongoDB
connectDB();

const app = express();

// Disable ETag generation to prevent 304 Not Modified responses
app.disable('etag');

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Add universal headers to fully disable caching for API endpoints
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
});

// Serve static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth',          authRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/intercity',     intercityRoutes);
app.use('/api/rental',        rentalRoutes);
app.use('/api/customers',     customerRoutes);
app.use('/api/drivers',       driverRoutes);
app.use('/api/employees',     employeeRoutes);
app.use('/api/finance',       financeRoutes);
app.use('/api/support',       supportRoutes);
app.use('/api/sos',           sosRoutes);

app.use('/api/coupons',       couponRoutes);
app.use('/api/incentives',    incentiveRoutes);
app.use('/api/packages',      packageRoutes);
app.use('/api/rental-packages', rentalPackageRoutes);
app.use('/api/destinations',  destinationsRoutes);
app.use('/api/services',      serviceRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/settings',      settingsRoutes);
app.use('/api/roles',         roleRoutes);
app.use('/api/pricing',       pricingRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MyTaxi API running on port ${PORT}`));

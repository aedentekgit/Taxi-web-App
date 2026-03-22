const router = require('express').Router();
const { getStats, getRevenueChart, getRecentBookings, getRideDistribution } = require('../controllers/dashboardController');
const { protect, authorizePage } = require('../middleware/auth');

router.use(protect);
router.use(authorizePage('dashboard'));
router.get('/stats',             getStats);
router.get('/revenue-chart',     getRevenueChart);
router.get('/recent-bookings',   getRecentBookings);
router.get('/ride-distribution', getRideDistribution);

module.exports = router;

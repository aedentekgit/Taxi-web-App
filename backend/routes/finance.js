const router = require('express').Router();
const c = require('../controllers/financeController');
const { protect, authorizePage } = require('../middleware/auth');

router.use(protect);
router.use(authorizePage('finance'));
router.get('/summary',        c.getSummary);
router.get('/top-drivers',    c.getTopDrivers);
router.get('/revenue-trend',  c.getRevenueTrend);

module.exports = router;

const express = require('express');
const router = express.Router();
const incentiveController = require('../controllers/incentiveController');
const { protect, authorizePage } = require('../middleware/auth');

router.post('/create',             protect, authorizePage('incentives'), incentiveController.create);
router.put('/:id',                 protect, authorizePage('incentives'), incentiveController.update);
router.get('/',                    protect, authorizePage('incentives'), incentiveController.getAll);
router.patch('/toggle/:id',        protect, authorizePage('incentives'), incentiveController.toggleStatus);
router.get('/progress/:driverId',  protect, authorizePage('incentives'), incentiveController.getProgressByDriver);

// Driver specific routes
router.get('/driver/active',       protect, incentiveController.getActiveForDriver);
router.post('/driver/ride-finish', protect, incentiveController.processRideIncentive); // Could be internal server-to-server call

module.exports = router;

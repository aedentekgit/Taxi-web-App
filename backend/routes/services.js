const router = require('express').Router();
const c = require('../controllers/serviceController');
const { protect, authorizePage } = require('../middleware/auth');

// Public routes (if needed, though controller says admin only for mutations)
router.get('/', c.getAllServices);
router.get('/:id', c.getServiceById);

// Protected routes
router.use(protect);
router.use(authorizePage('settings')); // Assuming services fall under settings or general admin

router.post('/', c.createService);
router.put('/:id', c.updateService);
router.patch('/:id/status', c.toggleStatus);
router.delete('/:id', c.deleteService);

module.exports = router;

const router = require('express').Router();
const c = require('../controllers/settingsController');
const { protect, authorize, authorizePage } = require('../middleware/auth');

// Public (no auth) — only non-secret general/app_config values
router.get('/public', c.getPublic);

// All other routes require authentication
router.use(protect);
router.use(authorizePage('settings'));

// GET all settings grouped by category
router.get('/', c.getAll);

// Seed defaults
router.post('/seed', c.seed);

// Single key routes (must come before /:category to avoid conflict)
router.get('/key/:key',    c.getByKey);
router.put('/key/:key',    c.updateKey);
router.delete('/key/:key', c.deleteKey);

// Category routes
router.get('/:category',   c.getByCategory);
router.put('/:category',   c.updateCategory);

// Create a new custom setting
router.post('/', c.create);

module.exports = router;

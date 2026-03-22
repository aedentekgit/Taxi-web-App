const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { protect, authorizePage } = require('../middleware/auth');

router.use(protect);

router.get('/', packageController.getAll);
router.get('/:id', packageController.getOne);

// Protected routes using RBAC mapping for 'packages'
router.use(authorizePage('packages'));

router.post('/', packageController.create);
router.put('/:id', packageController.update);
router.put('/:id/toggle-status', packageController.toggleStatus);
router.delete('/:id', packageController.remove);

module.exports = router;

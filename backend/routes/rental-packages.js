const router = require('express').Router();
const c = require('../controllers/rentalPackageController');
const { protect, authorizePage } = require('../middleware/auth');

// To authorize admins or those with access to the rental page
router.use(protect);
router.use(authorizePage('rental')); 

router.get('/', c.getAllPackages);
router.post('/', c.createPackage);
router.put('/:id', c.updatePackage);
router.patch('/:id/status', c.updatePackageStatus);
router.delete('/:id', c.deletePackage);

module.exports = router;

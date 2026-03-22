const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `pricing-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.get('/', pricingController.getAllPricing);

router.use(protect);
// Optional: restrict to certain roles
router.use(authorize('superadmin', 'admin'));

router.post('/', upload.single('icon_file'), pricingController.createPricing);
router.put('/:id', upload.single('icon_file'), pricingController.updatePricing);
router.patch('/:id/status', pricingController.updatePricingStatus);
router.delete('/:id', pricingController.deletePricing);

module.exports = router;

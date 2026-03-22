const router = require('express').Router();
const c = require('../controllers/couponController');
const { protect, authorizePage } = require('../middleware/auth');

router.use(protect);
router.use(authorizePage('coupons'));
router.get('/',                  c.getAll);
router.post('/',                 c.create);
router.put('/:id',               c.update);
router.put('/:id/toggle-status', c.toggleStatus);
router.delete('/:id',            c.remove);
router.post('/validate',         c.validate);

module.exports = router;

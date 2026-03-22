const router = require('express').Router();
const c = require('../controllers/bookingController');
const { protect, authorizePage } = require('../middleware/auth');

router.use(protect);
router.use(authorizePage('bookings'));
router.get('/',          c.getAll);
router.get('/:id',       c.getOne);
router.post('/',         c.create);
router.put('/:id/status',c.updateStatus);
router.delete('/:id',    c.remove);

module.exports = router;

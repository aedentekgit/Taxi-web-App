const router = require('express').Router();
const c = require('../controllers/rentalController');
const { protect, authorizePage } = require('../middleware/auth');

router.use(protect);
router.use(authorizePage('rental'));
router.get('/',           c.getAll);
router.get('/:id',        c.getOne);
router.post('/',          c.create);
router.put('/:id/status', c.updateStatus);
router.delete('/:id',     c.remove);

module.exports = router;

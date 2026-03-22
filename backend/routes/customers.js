const router = require('express').Router();
const c = require('../controllers/customerController');
const { protect, authorizePage } = require('../middleware/auth');

router.use(protect);
router.use(authorizePage('customers'));
router.get('/',                    c.getAll);
router.get('/:id',                 c.getOne);
router.post('/',                   c.create);
router.put('/:id',                 c.update);
router.put('/:id/toggle-status',   c.toggleStatus);
router.put('/:id/wallet',          c.updateWallet);
router.delete('/:id',              c.remove);

module.exports = router;

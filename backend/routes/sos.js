const router = require('express').Router();
const c = require('../controllers/sosController');
const { protect, authorizePage } = require('../middleware/auth');

router.use(protect);
router.use(authorizePage('sos'));
router.get('/',                  c.getAll);
router.get('/:id',               c.getOne);
router.put('/:id/acknowledge',   c.acknowledge);
router.put('/:id/resolve',       c.resolve);

module.exports = router;

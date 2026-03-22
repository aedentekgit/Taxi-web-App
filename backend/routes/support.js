const router = require('express').Router();
const c = require('../controllers/supportController');
const { protect, authorizePage } = require('../middleware/auth');

router.use(protect);
router.use(authorizePage('support'));
router.get('/',              c.getAll);
router.get('/:id',           c.getOne);
router.put('/:id/status',    c.updateStatus);
router.post('/:id/reply',    c.addReply);
router.put('/:id/assign',    c.assign);

module.exports = router;

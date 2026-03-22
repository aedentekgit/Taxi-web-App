const router = require('express').Router();
const c = require('../controllers/driverController');
const { protect, authorizePage } = require('../middleware/auth');

router.use(protect);
router.use(authorizePage('drivers'));
router.get('/',                  c.getAll);
router.get('/pending',           c.getPending);
router.get('/:id',               c.getOne);
router.post('/',                 c.create);
router.put('/:id',               c.update);
router.put('/:id/approve',       c.approve);
router.put('/:id/reject',        c.reject);
router.put('/:id/toggle-block',  c.toggleBlock);
router.delete('/:id',            c.remove);

module.exports = router;

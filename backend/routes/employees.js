const router = require('express').Router();
const c = require('../controllers/employeeController');
const { protect, authorize, authorizePage } = require('../middleware/auth');

router.use(protect);
router.use(authorizePage('employees'));
router.get('/',                    c.getAll);
router.get('/:id',                 c.getOne);
router.post('/',                   c.create);
router.put('/:id',                 c.update);
router.put('/:id/toggle-status',   c.toggleStatus);
router.delete('/:id',              c.remove);

module.exports = router;

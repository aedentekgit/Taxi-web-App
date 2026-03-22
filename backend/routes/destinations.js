const router = require('express').Router();
const c = require('../controllers/destinationController');
const { protect, authorizePage } = require('../middleware/auth');

router.use(protect);
router.use(authorizePage('packages')); // Assuming destinations fall under packages or a similar growth pillar

router.get('/',           c.getAll);
router.get('/:id',        c.getOne);
router.post('/',          c.create);
router.put('/:id',        c.update);
router.patch('/:id/status', c.toggleStatus); // Or PUT if frontend uses PUT
router.delete('/:id',     c.remove);

module.exports = router;

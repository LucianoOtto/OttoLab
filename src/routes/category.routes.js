const { Router } = require('express');
const categoryController = require('../controllers/category.controller');
const requireAuth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = Router();

router.get('/', categoryController.getAll); // público

router.post('/', requireAuth, requireRole('admin', 'editor'), categoryController.create);
router.put('/:id', requireAuth, requireRole('admin', 'editor'), categoryController.update);
router.delete('/:id', requireAuth, requireRole('admin'), categoryController.remove);

module.exports = router;
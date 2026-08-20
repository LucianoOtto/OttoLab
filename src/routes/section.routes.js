const { Router } = require('express');
const sectionController = require('../controllers/section.controller');
const requireAuth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = Router();

router.get('/', sectionController.getAll); // público

router.post('/', requireAuth, requireRole('admin', 'editor'), sectionController.create);
router.put('/:id', requireAuth, requireRole('admin', 'editor'), sectionController.update);
router.delete('/:id', requireAuth, requireRole('admin'), sectionController.remove);

module.exports = router;

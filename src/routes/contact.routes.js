const { Router } = require('express');
const contactController = require('../controllers/contact.controller');
const requireAuth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = Router();

router.post('/', contactController.submit); // público: formulario de contacto

router.get('/', requireAuth, requireRole('admin', 'editor'), contactController.getAll);
router.patch('/:id/status', requireAuth, requireRole('admin', 'editor'), contactController.updateStatus);

module.exports = router;
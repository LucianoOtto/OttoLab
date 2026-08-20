// src/routes/product.routes.js

const { Router } = require('express');
const router = Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuth.middleware');

router.get('/', optionalAuthMiddleware, productController.getAll);
router.get('/:id', optionalAuthMiddleware, productController.getById);

router.post('/import-preview', authMiddleware, productController.previewMakerworld);
router.post('/download-image', authMiddleware, productController.downloadProductImage);
router.post('/', authMiddleware, productController.create);
router.put('/:id', authMiddleware, productController.update);
router.delete('/:id', authMiddleware, productController.remove);

module.exports = router;
const { Router } = require('express');

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const sectionRoutes = require('./section.routes');
const contactRoutes = require('./contact.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/sections', sectionRoutes);
router.use('/contact', contactRoutes);

module.exports = router;
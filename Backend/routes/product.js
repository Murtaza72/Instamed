const express = require('express');

const router = express.Router();

const productController = require('../controllers/product');
const { isAuthenticated } = require('../middleware/auth');

router.get('/products', isAuthenticated, productController.getAllProducts);

router.get('/product/:id', productController.getProductDetails);

// Admin
router.post('/product/new', productController.createProduct);

router.put('/product/:id', productController.updateProduct);

router.delete('/product/:id', productController.deleteProduct);

module.exports = router;

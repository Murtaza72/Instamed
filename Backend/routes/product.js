const express = require('express');

const router = express.Router();

const productController = require('../controllers/product');
const { isAuthenticated, isAuthorized } = require('../middleware/auth');

router.get('/products', productController.getAllProducts);

router.get('/product/:id', productController.getProductDetails);

router.get('/review/:id', productController.getProductReviews);

router.put('/review', isAuthenticated, productController.createAndUpdateReview);

router.delete('/review/:id', isAuthenticated, productController.deleteReview);

// Admin
router.post(
    '/product/new',
    isAuthenticated,
    isAuthorized('Admin'),
    productController.createProduct
);

router.put(
    '/product/:id',
    isAuthenticated,
    isAuthorized('Admin'),
    productController.updateProduct
);

router.delete(
    '/product/:id',
    isAuthenticated,
    isAuthorized('Admin'),
    productController.deleteProduct
);

module.exports = router;

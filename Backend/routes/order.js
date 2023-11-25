const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order');
const { isAuthenticated, isAuthorized } = require('../middleware/auth');

router.get('/order/:id', isAuthenticated, orderController.getOrder);

router.post('/order/new', isAuthenticated, orderController.createOrder);

router.get('/orders/me', isAuthenticated, orderController.myOrders);

// Admin
router.get(
    '/admin/orders',
    isAuthenticated,
    isAuthorized('Admin'),
    orderController.getAllOrders
);

router.put(
    '/admin/order/:id',
    isAuthenticated,
    isAuthorized('Admin'),
    orderController.updateOrderStatus
);

router.delete(
    '/admin/order/:id',
    isAuthenticated,
    isAuthorized('Admin'),
    orderController.deleteOrder
);

module.exports = router;

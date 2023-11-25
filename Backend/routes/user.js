const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');
const { isAuthenticated, isAuthorized } = require('../middleware/auth');

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.post('/logout', userController.logoutUser);

router.get('/me', isAuthenticated, userController.getUserDetails);

// router.post('/password/forgot', userController.forgotPassword);

// Admin
router.get(
    '/admin/users',
    isAuthenticated,
    isAuthorized('Admin'),
    userController.getAllUsers
);

router.get(
    '/admin/user/:id',
    isAuthenticated,
    isAuthorized('Admin'),
    userController.getUser
);

// router.put(
//     '/admin/user/:id',
//     isAuthenticated,
//     isAuthorized('Admin'),
//     userController.updateUserRole
// );

router.delete(
    '/admin/delete/:id',
    isAuthenticated,
    isAuthorized('Admin'),
    userController.deleteUser
);

module.exports = router;

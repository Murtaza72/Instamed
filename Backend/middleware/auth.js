const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('./catchAsyncError');
const jwt = require('jsonwebtoken');
const User = require('../model/user');

// exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
//     const { token } = req.cookies;

//     if (!token) {
//         return next(
//             new ErrorHandler('You need to be logged in to do this', 401)
//         );
//     }
//     const decodedData = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = await User.findById(decodedData.id);

//     next();
// });

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(
            new ErrorHandler('Please Login to access this resource', 401)
        );
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next();
});

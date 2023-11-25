const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('./catchAsyncError');
const jwt = require('jsonwebtoken');
const User = require('../model/user');

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    console.log(token);

    if (token.includes('null')) {
        return next(
            new ErrorHandler('You need to be logged in to do this', 401)
        );
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next();
});

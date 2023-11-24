const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');

const User = require('../model/user');

const sendToken = require('../utils/jwtToken');

exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
    });

    const token = user.getJWTToken();

    sendToken(user, 200, res);
});

exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter Email and Password', 400));
    }

    const user = await User.findOne({ email: email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 400));
    }

    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 400));
    }

    const token = user.getJWTToken();

    sendToken(user, 200, res);
});

exports.logoutUser = catchAsyncError(async (req, res, next) => {
    res.cookie('token', null, {
        expiresIn: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: 'Logged out',
    });
});

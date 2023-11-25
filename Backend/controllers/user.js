const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');

const User = require('../model/user');

const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

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

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get('host')}
    /password/reset/${resetToken}`;

    const message = `Your password reset token is:- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email, then please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Instamed Password Reset`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent successfully to ${user.email}`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new ErrorHandler(
                'Reset Password Token is invalid or has been expired',
                400
            )
        );
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not password', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Old password is incorrect', 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler('password does not match', 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    if (req.body.avatar !== '') {
        const user = await User.findById(req.user.id);

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: 'scale',
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// Admin

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({ success: true, users });
});

exports.getUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler('User not found', 404));

    res.status(200).json({ success: true, user });
});

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
    const newRole = {
        role: req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id, newRole, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHandler(
                `User does not exist with Id: ${req.params.id}`,
                400
            )
        );
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: 'User Deleted Successfully',
    });
});

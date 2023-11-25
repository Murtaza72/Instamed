const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
    },
    email: {
        type: String,
        required: [true, 'Please enter your email address'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [8, 'Password should be min 8 characters'],
        select: false,
    },
    role: {
        type: String,
        default: 'User',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

User.pre('save', async function (next) {
    // If name and email were modified it will try to rehash the hashed password
    // We only hash the password if it was modified
    if (!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

User.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

User.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

User.methods.getResetPasswordToken = function () {
    const token = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

    return token;
};

module.exports = mongoose.model('User', User);

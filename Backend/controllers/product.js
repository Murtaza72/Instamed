const catchAsyncError = require('../middlerware/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');

const Product = require('../model/product');

exports.createProduct = catchAsyncError(async (req, res, next) => {
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product,
    });
});

exports.getAllProducts = catchAsyncError(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });
});

exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.param.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product,
    });
});

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
    });
});

exports.getProductDetails = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
        success: true,
        product,
    });
});
const catchAsyncError = require('../middleware/catchAsyncError');
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
    let product = await Product.findById(req.params.id);

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

exports.getProductReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

// Create and Update
exports.createAndUpdateReview = catchAsyncError(async (req, res, next) => {
    const { productId, rating, comment } = req.body;

    const review = {
        userId: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        rev => rev.userId.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.userId.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        });
    } else {
        product.reviews.push(review);
    }

    let sum = 0;

    product.reviews.forEach(rev => {
        sum += rev.rating;
    });

    product.ratings = sum / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});

exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    const reviews = product.reviews.filter(
        rev => rev.userId.toString() !== req.user._id.toString()
    );

    let sum = 0;
    let ratings = 0;

    reviews.forEach(rev => {
        sum += rev.rating;
    });

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = sum / reviews.length;
    }

    await Product.findByIdAndUpdate(
        req.params.id,
        {
            reviews,
            ratings,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
    });
});

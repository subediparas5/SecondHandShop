const router = require('express').Router();
const verify = require('../verifyToken');
const Product = require('../models/Product');
const ProductComment = require('../models/ProductComment');
const { productCommentValidation } = require("../validation");
const mongoose = require('mongoose');
const ProductCommentReply = require('../models/ProductCommentReply');

router.get('/:product_id/comments', async (request, response) => {
    if (!mongoose.Types.ObjectId.isValid(request.params.product_id)) {
        return response.status(400).send({
            message: "No product found with this id",
            data: {}
        });
    }
    await Product.findOne({ _id: request.params.product_id })
        .then(async (product) => {
            if (!product) {
                response.send({
                    message: "No Product Found",
                    data: {}
                });
            }
            else {
                try {
                    let queryList = [
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user_id',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        {
                            $unwind: '$user'
                        },
                        {
                            $lookup: {
                                from: 'productcommentreplies',
                                localField: 'reply',
                                foreignField: '_id',
                                as: 'replies'
                            }
                        },
                        {
                            $match: {
                                "product_id": mongoose.Types.ObjectId(request.params.product_id)
                            }
                        },
                        {
                            $project: {
                                '_id': 1,
                                "product_id": 1,
                                'user_id': 1,
                                'comment': 1,
                                'user._id': 1,
                                'user.name': 1,
                                'replies._id': 1,
                                'replies.user_id': 1,
                                'replies.reply': 1,
                                'replies.createdAt': 1,
                            }
                        }
                    ];

                    ProductComment.aggregate(queryList)
                        .then(comment => {
                            try {
                                if (comment.length > 0) {
                                    return response.send({
                                        message: "Data retrived",
                                        data: comment.map(doc => ProductComment.hydrate(doc)),
                                    });
                                }
                                else {
                                    return response.status(400).send({
                                        message: "No Comments Found",
                                        data: {}
                                    });
                                }
                            } catch (err) {
                                return response.status(400).send({
                                    message: err.message || "Error occured",
                                    data: err
                                });
                            }
                        })


                } catch (err) {
                    return response.status(400).send({
                        message: err.message || "Error occured",
                        data: err
                    });
                }
            }
        })
})


router.post('/:product_id/comments/add', verify, async (request, response) => {
    if (!mongoose.Types.ObjectId.isValid(request.params.product_id)) {
        return response.status(400).send({
            message: "No product found with this id",
            data: {}
        });
    }

    await Product.findOne({ _id: request.params.product_id })
        .then(async (product) => {
            if (!product) {
                response.send({
                    message: "No Product Found",
                    data: {}
                });
            }
            else {
                try {
                    const { error } = productCommentValidation(request.body);
                    if (error) return response.status(400).send({
                        message: error.details[0].message,
                        data: error.details[0]
                    });

                    const productComment = new ProductComment({
                        comment: request.body.comment,
                        user_id: request.user._id,
                        product_id: request.params.product_id,
                    })

                    const savedComment = await productComment.save();
                    await Product.updateOne(
                        { _id: request.params.product_id },
                        { $push: { comments: savedComment._id} }
                    )
                    await Product.updateOne({ _id: request.params.product_id },
                        {popularity:product.popularity+30})

                    response.send({
                        message: "Comment added successfully.",
                        data: savedComment
                    });

                } catch (err) {
                    return response.status(400).send({
                        message: err.message || "Error occured",
                        data: err
                    });
                }
            }
        })
        .catch((err) => {
            response.status(400).send({
                message: err.message || "Error occured while retriving products data",
                data: err
            });
        })


});


router.put('/comment/update/:comment_id', verify, async (request, response) => {
    if (!mongoose.Types.ObjectId.isValid(request.params.comment_id)) {
        return response.status(400).send({
            message: "No comment found with this id",
            data: {}
        });
    }

    await ProductComment.findOne({ _id: request.params.comment_id })
        .then(async (comment) => {
            if (!comment) {
                response.send({
                    message: "No Comment Found",
                    data: {}
                });
            }
            else {
                if (comment.user_id != user._id) {
                    return response.status(400).send({
                        message: "Access Denied",
                        data: {}
                    });
                }
                else {
                    try {
                        const { error } = productCommentValidation(request.body);
                        if (error) return response.status(400).send({
                            message: error.details[0].message,
                            data: error.details[0]
                        });

                        await ProductComment.updateOne(
                            { _id: request.params.comment_id },
                            { comment: request.body.comment }
                        );

                    }
                    catch (err) {
                        return response.status(400).send({
                            message: err.message || "Error occured",
                            data: err
                        });
                    }
                }
            }
        })
})


router.delete('/comment/delete/:comment_id', verify, async (request, response) => {
    if (!mongoose.Types.ObjectId.isValid(request.params.comment_id)) {
        return response.status(400).send({
            message: "No comment found with this id",
            data: {}
        });
    }
    await ProductComment.findOne({ _id: request.params.comment_id })
        .then(async (comment) => {
            if (!comment) {
                response.send({
                    message: "No Comment Found",
                    data: {}
                });
            }
            else {
                if (comment.user_id != request.user._id) {
                    return response.status(400).send({
                        message: "Access Denied",
                        data: {}
                    });
                }
                else {
                    try {
                        await ProductComment.deleteOne({ _id: comment._id, user_id: request.user._id })
                        await ProductCommentReply.deleteMany({ comment_id: comment._id })
                        response.send({
                            message: "Comment deleted successfully.",
                            data: {}
                        });
                    }
                    catch (err) {
                        return response.status(400).send({
                            message: err.message || "Error occured",
                            data: err
                        });
                    }
                }
            }
        })
        .catch((err) => {
            return response.status(400).send({
                message: err.message || "Error occured",
                data: err
            });
        })

})

module.exports = router;
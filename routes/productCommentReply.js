const router = require('express').Router();
const verify = require('../verifyToken');
const Product = require('../models/Product');
const ProductComment = require('../models/ProductComment');
const { commentReplyValidation } = require("../validation");
const mongoose = require('mongoose');
const ProductCommentReply = require('../models/ProductCommentReply')

router.post('/reply/:comment_id/add', verify, async (request, response) => {
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
                try {
                    const { error } = commentReplyValidation(request.body);
                    if (error) return response.status(400).send({
                        message: error.details[0].message,
                        data: error.details[0]
                    });

                    const commentReply = new ProductCommentReply({
                        reply: request.body.reply,
                        user_id: request.user._id,
                        comment_id: request.params.comment_id,
                    })

                    const savedCommentReply = await commentReply.save();
                    await ProductComment.updateOne(
                        { _id: request.params.comment_id },
                        { $push: { reply: savedCommentReply._id } }
                    )

                    response.send({
                        message: "Reply added successfully.",
                        data: savedCommentReply
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
                message: err.message || "Error occured while retriving comments data",
                data: err
            });
        })


});


router.put('/reply/update/:reply_id', verify, async (request, response) => {
    if (!mongoose.Types.ObjectId.isValid(request.params.reply_id)) {
        return response.status(400).send({
            message: "No reply found with this id",
            data: {}
        });
    }

    await ProductCommentReply.findOne({ _id: request.params.reply_id })
        .then(async (reply) => {
            if (!reply) {
                response.send({
                    message: "No Reply Found",
                    data: {}
                });
            }
            else {
                if (reply.user_id != request.user._id) {
                    return response.status(400).send({
                        message: "Access Denied",
                        data: {}
                    });
                }
                else {
                    try {
                        const { error } = commentReplyValidation(request.body);
                        if (error) return response.status(400).send({
                            message: error.details[0].message,
                            data: error.details[0]
                        });

                        await ProductCommentReply.updateOne({ _id: reply._id }, {
                            reply: request.body.reply,
                        });

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
                                    from: 'productcomments',
                                    localField: 'comment_id',
                                    foreignField: '_id',
                                    as: 'comment'
                                }
                            },
                            {
                                $unwind: '$comment'
                            },
                            {
                                $match: {
                                    "_id": mongoose.Types.ObjectId(request.params.reply_id)
                                }
                            },
                            {
                                $project: {
                                    '_id': 1,
                                    'comment_id': 1,
                                    'reply': 1,
                                    'updatedAt': 1,
                                    'user._id': 1,
                                    'user.name': 1,
                                    'comment._id': 1,
                                    'comment.product_id': 1,
                                    'comment.updatedAt': 1,
                                    'comment.comment': 1,
                                    'comment.user_id': 1,
                                }
                            }
                        ];

                        let updatedReply = await ProductCommentReply.aggregate(queryList);
                        response.send({
                            message: "Reply edited successfully",
                            reply: ProductCommentReply.hydrate(updatedReply[0])
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
            response.status(400).send({
                message: err.message || "Error occured while retriving comments data",
                data: err
            });
        })
})


router.delete('/reply/delete/:reply_id', verify, async (request, response) => {
    if (!mongoose.Types.ObjectId.isValid(request.params.reply_id)) {
        return response.status(400).send({
            message: "No reply found with this id",
            data: {}
        });
    }
    await ProductCommentReply.findOne({ _id: request.params.reply_id })
        .then(async (reply) => {
            if (!reply) {
                response.send({
                    message: "No Reply Found",
                    data: {}
                });
            }
            else {
                if (reply.user_id != request.user._id) {
                    return response.status(400).send({
                        message: "Access Denied",
                        data: {}
                    });
                }
                else {
                    try {
                        await ProductCommentReply.deleteOne({ _id: reply._id });
                        await ProductComment.updateOne(
                            { _id: reply.comment_id },
                            {
                                $pullAll: { 'reply': [request.params.reply_id] }
                            }
                        )
                        response.send({
                            message: "Reply deleted successfully",
                            data: {}
                        });
                    }
                    catch (err) {
                        response.status(400).send({
                            message: err.message || "Error occured while retriving comments data",
                            data: err
                        });
                    }

                }
            }
        })
        .catch((err) => {
            response.status(400).send({
                message: err.message || "Error occured while retriving comments data",
                data: err
            });
        })
})

module.exports = router;
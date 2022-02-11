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

module.exports = router;
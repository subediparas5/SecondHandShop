const router = require('express').Router();
const verify = require('../verifyToken');
const Joi = require('@hapi/joi');
const Product = require('../models/Product');
const ProductComment = require('../models/ProductComment');
const { productCommentValidation } = require("../validation");
const mongoose = require('mongoose');


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
                        { $push: { comments: savedComment._id } }
                    )

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

module.exports = router;
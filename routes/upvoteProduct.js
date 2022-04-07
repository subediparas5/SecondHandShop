const router = require('express').Router();
const Product = require('../models/Product');
const verify = require('../verifyToken');
const Upvote= require('../models/Upvote')
const mongoose = require('mongoose');

router.post('/:product_id', verify, async (request, response) => {
    if (!mongoose.Types.ObjectId.isValid(request.params.product_id)) {
        return response.status(400).send({
            message: "No product found with this id",
            data: {}
        });
    }
    let product = await Product.findOne({ _id: request.params.product_id })
    if (product) {
        await Product.updateOne({ _id: request.params.product_id },
            { popularity: product.popularity + 20 }
        )
        const upvote= new Upvote({
            product_id: product._id,
            user_id:request.user._id
        })

        const savedUpvote= await upvote.save();

        return response.send({
            message: "Product upvoted successfully",
            data: savedUpvote
        });
    }
    else {
        return response.send({
            message: "Product not found",
            data: {}
        });
    }
})

module.exports = router;
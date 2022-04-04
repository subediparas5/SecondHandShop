const router = require('express').Router();
const verify = require('../verifyToken');
const FeaturedProduct = require('../models/FeaturedProduct')
const Admin = require('../models/Admin')
const mongoose = require('mongoose');
const Product = require('../models/Product');

router.post('/:product_id', verify, async (request, response) => {
    let admin_check = await Admin.findOne({ user_id: request.user._id })
    if (admin_check) {
        let product_check = await FeaturedProduct.findOne({ product_id: request.params.product_id })
        try {
            let data;
            let date;
            if (product_check) {
                const isToday = (someDate) => {
                    const today = new Date()
                    return someDate.getDate() == today.getDate() &&
                        someDate.getMonth() == today.getMonth() &&
                        someDate.getFullYear() == today.getFullYear()
                }
                if (isToday(product_check.updatedAt)) {
                    return response.send({
                        message: "Feature the product another day",
                        data: {}
                    });
                }
                let db_date = new Date(product_check.expiryDate).getTime()
                //expired
                if (db_date <= Date.now()) {
                    date = new Date()
                    data = await FeaturedProduct.updateOne(
                        { product_id:product_check.product_id },
                        {
                            expiryDate: date.setDate(date.getDate() + 30),
                            featured_by: admin_check.user_id
                        }
                    )
                }
                //not expired
                else {
                    date = new Date(db_date);
                    data = await FeaturedProduct.updateOne(
                        { product_id: product_check.product_id },
                        {
                            expiryDate: date.setDate(date.getDate() + 30),
                            featured_by: admin_check.user_id
                        }
                    )
                }
            }
            else {
                let product = await Product.findOne({ _id: request.params.product_id })
                if (product) {
                    date = new Date();
                    const featuredProduct = new FeaturedProduct({
                        product_id:product._id,
                        expiryDate: date.setDate(date.getDate() + 30),
                        featured_by: admin_check.user_id
                    });
                    data = await featuredProduct.save();
                }
                else {
                    return response.send({
                        message: "Product not found",
                        data: {}
                    });
                }

            }
            

            return response.send({
                message: "Product featured successfully",
                data: data
            });
        } catch (err) {
            return response.status(400).send(err);
        }

    }
    else {
        return response.send({
            message: "Permission Denied! Only admins can feature product.",
            data: {}
        });
    }
});


router.get('/all', verify, async (request, response) => {
    try {
        let queryList = [
            {
                $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
        ]
        if (request.query.product_id) {
            queryList.push({
                $match: {
                    product_id: mongoose.Types.ObjectId(request.query.product_id)
                },
            })
        }
        queryList.push({
            $project: {
                '_id': 1,
                "product.product_name": 1,
                'product.description': 1,
                'product.image': 1,
                'product.price': 1,
                'product.availability': 1,
                'product.address': 1,
                'product.condition': 1,
                'product.tags': 1,
                "product.negotiation": 1,
                'product.delivery': 1,
                'product.usedFor': 1,
                'product.createdAt': 1,
                'product.owner.name': 1,
                'product.owner.email': 1,
                'product.owner._id': 1,
                // 'category_details._id': 1,
                // 'category_details.slug': 1,
                // 'category_details.sub_slug': 1,
                // 'category_details.name': 1,
                'comments': -1
            }
        });

        FeaturedProduct.aggregate(queryList)
            .then(product => {
                return response.send({
                    message: "Data retrived",
                    data: product.map(doc => FeaturedProduct.hydrate(doc)),
                })
            });
    }
    catch (err) {
        response.status(400).send({
            message: err.message || "Error occured while retriving products data",
            data: err
        });
    }
})

module.exports = router;
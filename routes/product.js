const router = require('express').Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { productValidation, productUpdateValidation } = require("../validation");
const verify = require('../verifyToken');
const mongoose = require('mongoose');
const fs = require('fs');
const Joi = require('@hapi/joi');


router.post('/add', verify, async (request, response) => {
    if (request.files && request.files.image) {
        request.body["image"] = request.files.image
    }
    //validating data
    const { error } = productValidation(request.body);
    if (error) return response.status(400).send({
        message: error.details[0].message,
        data: error.details[0]
    });
    //check if product is already added on same account
    const productExist = await Product.findOne({ product_name: request.body.product_name, owner_id: request.user._id });
    if (productExist) {
        return response.status(400).send({
            message: 'Product already added from same account.'
        });
    }
    //Upload image
    try {

        if (request.files && request.files.image) {
            var image_file = request.files.image;
            var image_file_name = Date.now() + '-product-image-' + image_file.name;
            var image_path = publicPath + '/uploads/product_images/' + image_file_name;
            await image_file.mv(image_path);
        }
        //Create new Product
        const product = new Product({
            product_name: request.body.product_name,
            description: request.body.description,
            category: request.body.category,
            price: request.body.price,
            owner_id: request.user._id,
            address: request.body.address,
            condition: request.body.condition,
            image: image_file_name,
            tags: request.body.tags
        });
        const savedProduct = await product.save();
        // const populatedData = await Product.findById(savedProduct._id).populate('category').populate('owner_id').exec();
        // let populatedData = await savedProduct.populate('category').populate('owner_id').execPopulate();
        let queryList = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner_id',
                    foreignField: '_id',
                    as: 'owner'
                }

            },
            {
                $unwind: '$owner'
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category_details'
                }

            },
            {
                $unwind: '$category_details'
            },
            {
                $match: {
                    "_id": mongoose.Types.ObjectId(savedProduct._id)
                }
            },
            {
                $project: {
                    '_id': 1,
                    "product_name": 1,
                    'description': 1,
                    'image': 1,
                    'price': 1,
                    'availability': 1,
                    'address': 1,
                    'condition': 1,
                    'tags': 1,
                    'createdAt': 1,
                    'owner.name': 1,
                    'owner.email': 1,
                    'owner._id': 1,
                    'category_details._id': 1,
                    'category_details.slug': 1,
                    'category_details.sub_slug': 1,
                    'category_details.name': 1,
                }
            }
        ];
        let finalProduct = await Product.aggregate(queryList);
        response.send({
            message: "Product added successfully",
            product: Product.hydrate(finalProduct[0])
        });

    }
    catch (err) {
        response.status(400).send({
            message: err.message,
            product: err
        });
    }

});

router.get('/:product_id', async (request, response) => {
    if (!mongoose.Types.ObjectId.isValid(request.params.product_id)) {
        return response.status(400).send({
            message: "No product found with this id",
            data: {}
        });
    }
    try {
        let queryList = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner_id',
                    foreignField: '_id',
                    as: 'owner'
                }

            },
            {
                $unwind: '$owner'
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category_details'
                }

            },
            {
                $unwind: '$category_details'
            },
            {
                $match: {
                    "_id": mongoose.Types.ObjectId(request.params.product_id)
                }
            },
            {
                $project: {
                    '_id': 1,
                    "product_name": 1,
                    'description': 1,
                    'image': 1,
                    'price': 1,
                    'availability': 1,
                    'address': 1,
                    'condition': 1,
                    'tags': 1,
                    'createdAt': 1,
                    'owner.name': 1,
                    'owner.email': 1,
                    'owner._id': 1,
                    'category_details._id': 1,
                    'category_details.slug': 1,
                    'category_details.sub_slug': 1,
                    'category_details.name': 1,
                }
            }
        ];
        let product = await Product.aggregate(queryList);
        if (product.length > 0) {
            return response.send({
                message: "Data retrived",
                data: Product.hydrate(product[0])
            });
        }
        else {
            return response.status(400).send({
                message: "No Products Found",
                data: {}
            });
        }
    }
    catch (err) {
        return response.status(400).send({
            message: err.message || "Error occured while retriving product data",
            data: err
        });
    }
});


router.put('/:product_id/update', verify, async (request, response) => {

    if (!mongoose.Types.ObjectId.isValid(request.params.product_id)) {
        return response.status(400).send({
            message: "No product found with this id",
            data: {}
        });
    }

    await Product.findOne({ _id: request.params.product_id })
        .then(async (product) => {

            if (!product) {
                return response.status(400).send({
                    message: "No product found with this id",
                    data: {}
                });
            }
            else {
                if (product.owner_id != request.user._id) {
                    return response.status(400).send({
                        message: "Access Denied",
                        data: {}
                    });
                }
                else {
                    try {
                        if (request.files && request.files.image) {
                            request.body["image"] = request.files.image
                            Object.assign({}, productUpdateValidation, ({
                                image: Joi.any().required()
                            }));
                        }
                        //validating data
                        const { error } = productUpdateValidation(request.body);
                        if (error) return response.status(400).send({
                            message: error.details[0].message,
                            data: error.details[0]
                        });
                        var image_file_name;
                        if (request.files && request.files.image) {
                            var image_file = request.files.image;
                            image_file_name = Date.now() + '-product-image-' + image_file.name;
                            var image_path = publicPath + '/uploads/product_images/' + image_file_name;
                            await image_file.mv(image_path);
                            //delete old image of product
                            var old_path = publicPath + '/uploads/product_images/' + product.image;
                            if (fs.existsSync(old_path)) {
                                fs.unlinkSync(old_path)
                            }
                        }
                        else {
                            image_file_name = product.image
                        }
                        const nameDuplicateCheck = await Product.findOne({ product_name: request.body.product_name, owner_id: request.user._id });
                        if (nameDuplicateCheck) {
                            if (nameDuplicateCheck._id != request.params.product_id) {
                                return response.status(400).send({
                                    message: 'Product with same name already added from this account.'
                                });
                            }
                        }
                        await Product.updateOne({ _id: request.params.product_id }, {
                            product_name: request.body.product_name,
                            description: request.body.description,
                            category: request.body.category,
                            price: request.body.price,
                            address: request.body.address,
                            condition: request.body.condition,
                            image: image_file_name,
                            tags: request.body.tags
                        });

                        let queryList = [
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'owner_id',
                                    foreignField: '_id',
                                    as: 'owner'
                                }

                            },
                            {
                                $unwind: '$owner'
                            },
                            {
                                $lookup: {
                                    from: 'categories',
                                    localField: 'category',
                                    foreignField: '_id',
                                    as: 'category_details'
                                }

                            },
                            {
                                $unwind: '$category_details'
                            },
                            {
                                $match: {
                                    "_id": mongoose.Types.ObjectId(request.params.product_id)
                                }
                            },
                            {
                                $project: {
                                    '_id': 1,
                                    "product_name": 1,
                                    'description': 1,
                                    'image': 1,
                                    'price': 1,
                                    'availability': 1,
                                    'address': 1,
                                    'condition': 1,
                                    'tags': 1,
                                    'createdAt': 1,
                                    'owner.name': 1,
                                    'owner.email': 1,
                                    'owner._id': 1,
                                    'category_details._id': 1,
                                    'category_details.slug': 1,
                                    'category_details.sub_slug': 1,
                                    'category_details.name': 1,
                                }
                            }
                        ];
                        let finalProduct = await Product.aggregate(queryList);
                        response.send({
                            message: "Product updated successfully",
                            product: Product.hydrate(finalProduct[0])
                        });

                    } catch (err) {
                        return response.status(400).send({
                            message: err.message || "Error occured while retriving product data",
                            data: err
                        });
                    }
                }
            }

        }).catch((err) => {
            return response.status(400).send({
                message: err.message || "Error occured",
                data: err
            });
        })

})


router.get('/', async (request, response) => {

    try {
        let queryList = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner_id',
                    foreignField: '_id',
                    as: 'owner'
                }

            },
            {
                $unwind: '$owner'
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category_details'
                }

            },
            {
                $unwind: '$category_details'
            },
        ]

        if (request.query.keyword && request.query.keyword != '') {
            queryList.push({
                $match: {
                    $or: [
                        {
                            tags: { $regex: request.query.keyword, $options: '$i' }
                        },
                        {
                            product_name: { $regex: request.query.keyword, $options: '$i' }
                        },
                        // {
                        //     'owner.name': { $regex: request.query.keyword, $options: '$i' }
                        // },
                        {
                            'category_details.name': { $regex: request.query.keyword, $options: '$i' }
                        },
                        {
                            'category_details.sub_slug': { $regex: request.query.keyword, $options: '$i' }
                        },
                    ],
                },
            })
        }
        if (request.query.category) {
            queryList.push({
                $match: {
                    'category_details.slug': request.query.category,
                },
            })
        }
        if (request.query.userID) {
            queryList.push({
                $match: {
                    owner_id: mongoose.Types.ObjectId(request.query.userID)
                },
            })
        }
        let total = await Product.countDocuments(queryList);
        let page = (request.query.page) ? parseInt(request.query.page) : 1
        let perPage = (request.query.perPage) ? parseInt(request.query.perPage) : 10
        let skip = (page - 1) * perPage;
        queryList.push({
            $skip: skip,
        })
        queryList.push({
            $limit: perPage
        });
        queryList.push({
            $project: {
                '_id': 1,
                "product_name": 1,
                'description': 1,
                'image': 1,
                'price': 1,
                'availability': 1,
                'address': 1,
                'condition': 1,
                'tags': 1,
                'createdAt': 1,
                'owner.name': 1,
                'owner.email': 1,
                'owner._id': 1,
                'category_details._id': 1,
                'category_details.slug': 1,
                'category_details.sub_slug': 1,
                'category_details.name': 1,
            }
        });

        if (request.query.sortBy && request.query.sortOrder) {
            var sort = {};
            sort[request.query.sortBy] = (request.query.sortOrder == 'asc') ? 1 : -1;
            queryList.push({
                $sort: sort
            });
        }
        else {
            queryList.push({
                $sort: { createdAt: -1 }
            });
        }

        Product.aggregate(queryList)
            .then(product => {
                response.send({
                    message: "Data retrived",
                    data: product.map(doc => Product.hydrate(doc)),
                    meta: {
                        total: total,
                        currentPage: page,
                        perPage: perPage,
                        totalPages: Math.ceil(total / perPage),
                    }
                })
            });
    } catch (err) {
        response.status(400).send({
            message: error.message || "Error occured while retriving products data",
            data: err
        });
    }
    //@Desc
    //Without pagination and sorting
    // let queryList = {};
    // if (request.query.keyword) {
    //     queryList.$or = [
    //         { tags: { $regex: request.query.keyword, $options: '$i' } },
    //         { product_name: { $regex: request.query.keyword, $options: '$i' } }
    //     ]
    // }
    // if (request.query.category) {
    //     queryList.category = request.query.category;
    // }
    // if (request.query.id) {
    //     queryList = { _id: request.query.id };
    // }


    // Product.find(queryList)
    //     .populate('category')
    //     .populate('owner_id')
    //     .skip(0)
    //     .limit(10)
    //     .sort({ createdAt: -1 })
    //     .then(product => {
    //         response.send({
    //             message: "Data retrived",
    //             data: product
    //         })
    //     })
    //     .catch(error => {
    //         response.status(400).send({ message: error.message || "Error occured while retriving products data" })
    //     });

});


module.exports = router;
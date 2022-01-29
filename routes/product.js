const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const { productValidation } = require("../validation");
const verify = require('../verifyToken');
const mongoose = require('mongoose');



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
        const populatedData = await Product.findById(savedProduct._id).populate('category').populate('owner_id').exec();
        // let populatedData = await savedProduct.populate('category').populate('owner_id').execPopulate();
        response.send({
            message: "Product added successfully",
            product: populatedData
        });

    }
    catch (err) {
        response.status(400).send({
            message: err.message,
            product: err
        });
    }

});


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
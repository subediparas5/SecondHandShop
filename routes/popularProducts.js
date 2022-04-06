const router = require('express').Router();
const Product = require('../models/Product');

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
                'popularity':1,
                'tags': 1,
                "negotiation": 1,
                'delivery': 1,
                'usedFor': 1,
                'createdAt': 1,
                'owner.name': 1,
                'owner.email': 1,
                'owner._id': 1,
                'category_details._id': 1,
                'category_details.slug': 1,
                'category_details.sub_slug': 1,
                'category_details.name': 1,
                'comments': -1
            }
        });

            queryList.push({
                $sort: { popularity: -1 }
            });

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
            message: err.message || "Error occured while retriving products data",
            data: err
        });
    }
});

module.exports = router;
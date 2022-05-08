const router = require('express').Router();
const User = require('../models/User');
const mongoose = require('mongoose');

router.get('/', async (request, response) => {
    let queryList = []
    queryList.push({
        $project: {
            '_id': 1,
            'name': 1,
            'email': 1,
            'createdAt': 1,
            'updatedAt': 1,
        }
    });
    User.aggregate(queryList)
        .then(user => {
            response.send({
                message: "Data retrived",
                data: user.map(doc => User.hydrate(doc)),
            })
        })
})


router.get('/:user_id', async (request, response) => {
    if (!mongoose.Types.ObjectId.isValid(request.params.user_id)) {
        return response.status(400).send({
            message: "No user found with this id",
            data: {}
        });
    }

    let queryList = [
        {
            $project: {
                '_id': 1,
                'name': 1,
                'email': 1,
                'createdAt': 1,
                'updatedAt': 1,
            }
        },
        {
            $match: {
                "_id": mongoose.Types.ObjectId(request.params.user_id)
            }
        }
    ];
    User.aggregate(queryList)
        .then(user => {
            response.send({
                message: "Data retrived",
                data: user.map(doc => User.hydrate(doc)),
            })
        })

})


module.exports = router;
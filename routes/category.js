const router = require('express').Router();
const verify = require('../verifyToken');
const Category = require('../models/Category')

router.post('/', verify, async (request, response) => {
    const category = new Category({
        slug: request.body.slug,
        sub_slug: request.body.sub_slug,
        name: request.body.name,
    });
    try {
        const savedCategory = await category.save();
        response.send({
            message: "Category added",
            data: savedCategory._id
        });
    } catch (err) {
        response.status(400).send(err);
    }
});

router.get("/", async(request,response)=>{
    Category.find()
    .then(category=>{
        return response.send({
                        message: "Data retrived",
                        data: category
                    })
    })
})


module.exports = router;
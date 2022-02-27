const router = require('express').Router();
const verify = require('../verifyToken');
const FeaturedProduct = require('../models/FeaturedProduct')
const Admin = require('../models/Admin')

router.post('/:product_id', verify, async (request, response) => {
    let admin_check = await Admin.findOne({ user_id: request.user._id })
    //remove admin permission required after payment integration
    if (admin_check) {
        let product_check = await FeaturedProduct.findOne({ product_id: request.params.product_id })
        try {
            let data;
            let date;
            if (product_check) {

                //updated today
                //replace this with payment receipt id after payment integration
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

                //expired
                let db_date = new Date(product_check.expiryDate).getTime()
                if (db_date <= Date.now()) {
                    date = new Date()
                    data = await FeaturedProduct.updateOne(
                        { product_id: request.params.product_id },
                        {
                            expiryDate: date.setDate(date.getDate() + 30),
                            featured_by: admin_check.user_id
                        }
                    )
                }
                else {
                    //not expired
                    date = new Date(db_date);
                    data = await FeaturedProduct.updateOne(
                        { product_id: request.params.product_id },
                        {
                            expiryDate: date.setDate(date.getDate() + 30),
                            featured_by: admin_check.user_id
                        }
                    )
                }
            }
            else {
                date = new Date();
                const featuredProduct = new FeaturedProduct({
                    product_id: request.params.product_id,
                    expiryDate: date.setDate(date.getDate() + 30),
                    featured_by: admin_check.user_id
                });
                data = await featuredProduct.save();
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


router.get('/', verify, async (request, response) => {

 })

module.exports = router;
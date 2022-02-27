const router = require('express').Router();
const verify = require('../verifyToken');
const Admin = require('../models/Admin')

router.post('/add/:user_id', verify, async (request, response) => {
    let permissionCheck = await Admin.findOne({ user_id: request.user._id })
    if (permissionCheck) {
        let duplicateCheck = await Admin.findOne({ user_id: request.params.user_id })
        if (duplicateCheck) {
            response.send({
                message: "User is already an admin.",
                data: duplicateCheck
            });
        }
        else {
            const admin = new Admin({
                user_id: request.params.user_id
            });
            try {
                const savedAdmin = await admin.save();
                response.send({
                    message: "Admin added",
                    data: savedAdmin
                });
            } catch (err) {
                response.status(400).send(err);
            }
        }

    }
    else {
        response.send({
            message: "Permission Denied! Only Admin can add other admins",
            data: {}
        });
    }

});


module.exports = router;
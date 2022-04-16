const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { hashPassword, comparePassword } = require('../password');
const res = require('express/lib/response');


router.post('/forgot', async (request, response) => {
    const email = request.body.email;
    //checking if account exists with the email
    const user = await User.findOne({ email: email });
    if (!user) {
        return response.status(400).send('Email incorrect.');
    }
    else {
        //Create OTL valid for 15 mins.
        const secret = process.env.TOKEN_SECRET + user.password;
        const payload = {
            email: user.email,
            _id: user._id
        }

        const token = jwt.sign(payload, secret, { expiresIn: '1hr' })
        const link = `http://localhost:3000/password/reset/${user._id}/${token}`
        console.log(link)
        const transporter = nodemailer.createTransport(
            {
                service: 'gmail',
                auth: {
                    user: process.env.SERVER_EMAIL,
                    pass: process.env.SERVER_PASSWORD,
                }
            }
        );
        const details = {
            from: process.env.email,
            to: user.email,
            subject: "Reset Password",
            text: "Hello, " + user.name + ",\nPlease use this link within 15 minutes to reset your password for Second Hand Shop.\n If you had not requested for password reset you can ignore this message.\n" + link
        };
        transporter.sendMail(details, (err, info) => {
            if (err) {
                console.log(err)
                return response.send({
                    message: "Error Occured",
                    data: err
                });
            }
            else {

                return response.send({
                    message: "Password reset link has been sent via email.",
                    data: info.response
                })
            }
        })
    }
})
router.get('/reset/:id/:token', async (request, response, next) => {

// response.send(req.params)
    const user = await User.findOne({ _id: request.params.id });
    if (user) {
        try {
            const secret = process.env.TOKEN_SECRET + user.password;
            const payload=jwt.verify(request.params.token,secret)
            return response.render('reset-password',{email:user.email})
        }
        catch (err) {
            return response.send({
                message: "Error occured",
                data: err.message
            })
        }
    }
    else {
        return response.send({
            message: "User not found",
            data: ""
        })
    }
})
router.post('/reset/:id/:token', async (request, response, next) => {
    const { id, token } = request.params;
    
    const password=request.body.password
    const password2=request.body.password2
    if(password.length<=6){
        return response.send({
            message: "Password needs to be longer than 6 characters.",
            data:""
        }) 
    }
    
    if(password==password2){
        const user = await User.findById(id);
        if (user) {
            try {
                const hashedPassword=await hashPassword(password)
                const secret = process.env.TOKEN_SECRET + user.password;
                const payload=jwt.verify(token,secret)
                console.log(hashedPassword);
                const reset=await User.updateOne({_id:payload._id,email:payload.email},{password:hashedPassword})
                return response.send({
                    message: "Password reset successfully",
                    data:reset
                })
            }
            catch (err) {
                return response.send({
                    message: "Error occured",
                    data: err.message
                })
            }
    
        }
        else {
            return response.send({
                message: "User not found",
                data: ""
            })
        }
    }
    else {
        return response.send({
            message: "Passwords didn't match."
        })
    }
    
})

module.exports = router;
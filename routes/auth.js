const router = require('express').Router();
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../validation');
const { hashPassword, comparePassword } = require('../password');
const jwt = require('jsonwebtoken');


router.post('/register', async (request, response) => {
    //validating data
    const { error } = registerValidation(request.body);
    if (error) return response.status(400).send({
        message: error.details[0].message,
        data: error.details[0]
    });
    //check if user is already registered with same email
    const emailExist = await User.findOne({ email: request.body.email });
    if (emailExist) {
        return response.status(400).send({ message: 'Email already registered.' });
    }
    const hashedPassword = await hashPassword(request.body.password);
    //Create new User
    const user = new User({
        name: request.body.name,
        email: request.body.email,
        password: hashedPassword,
    });
    try {
        const savedUser = await user.save();
        response.send({
            message: "User registeration complete",
            data: savedUser._id
        });
    } catch (err) {
        response.status(400).send(err);
    }
});


router.post('/login', async (request, response) => {
    const { error } = loginValidation(request.body);
    if (error) return response.status(400).send(error.details[0].message);
    //checking if account exists with the email
    const user = await User.findOne({ email: request.body.email });
    if (!user) {
        return response.status(400).send('Email incorrect.');
    }
    //Check if password is correct
    const validPass = await comparePassword(request.body.password, user.password);
    if (validPass) {
        //Create and assign token
        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '365d' });
        response.header("auth-token", token).send({
            message: "User logged in",
            data: token
        });
    }
    else {
        return response.send({
            message: 'Password incorrect.'
        })
    }
});

module.exports = router;
const Joi = require('@hapi/joi');
const { schema } = require('./models/Product');

//Register Validation
const registerValidation = (data) => {
    const validationSchema = Joi.object({
        name: Joi.string().min(6).required(),
        email: Joi.string().min(6).required().email({ minDomainSegments: 2 }),
        password: Joi.string().min(6).required(),
    });
    return validationSchema.validate(data);
};

//Login Validation
const loginValidation = (data) => {
    const validationSchema = Joi.object({
        email: Joi.string().min(6).required().email({ minDomainSegments: 2 }),
        password: Joi.string().min(6).required(),
    });
    return validationSchema.validate(data);
};

//Product Validation
const productValidation = (data) => {
    const validationSchema = Joi.object({
        product_name: Joi.string().min(3).max(255).required(),
        description: Joi.string().min(25).max(1024).required(),
        price: Joi.number().min(100).max(500000).required(),
        availability: Joi.boolean(),
        address: Joi.string().min(5).max(255).required(),
        condition: Joi.string().required(),
        image: Joi.any().required(),
        category: Joi.any().required(),
        tags: Joi.array().items(Joi.string().min(1).required())
    });
    return validationSchema.validate(data);
}
//Product Update Validation
const productUpdateValidation = (data) => {
    const validationSchema = Joi.object({
        product_name: Joi.string().min(3).max(255).required(),
        description: Joi.string().min(25).max(1024).required(),
        price: Joi.number().min(100).max(500000).required(),
        availability: Joi.boolean(),
        address: Joi.string().min(5).max(255).required(),
        condition: Joi.string().required(),
        category: Joi.any().required(),
        image: Joi.any(),
        tags: Joi.array().items(Joi.string().min(1).required())
    });
    return validationSchema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.productValidation = productValidation;
module.exports.productUpdateValidation = productUpdateValidation;
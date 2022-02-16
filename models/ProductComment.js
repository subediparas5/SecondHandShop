const mongoose = require('mongoose');

const productCommentSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comment: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 255
    },
    reply: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCommentReply'
    }]
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('ProductComment', productCommentSchema);
const mongoose = require('mongoose');

const productCommentReplySchema = new mongoose.Schema({
    comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductComment'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reply: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 255
    }
})

module.exports = mongoose.model('ProductCommentReply', productCommentReplySchema);
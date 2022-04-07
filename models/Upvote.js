const mongoose = require('mongoose');

const upvoteSchema=new mongoose.Schema({
    product_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
},
{
    timestamps: true
}
)

module.exports = mongoose.model('Upvote', upvoteSchema);
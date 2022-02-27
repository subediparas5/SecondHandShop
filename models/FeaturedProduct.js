const mongoose = require('mongoose');

const featuredProductSchema = new mongoose.Schema({
    product_id: String,
    expiryDate: Date,
    featured_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, { timestamps: true });

module.exports = mongoose.model('Featured Product', featuredProductSchema);
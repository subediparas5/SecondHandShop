const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255
    },
    description: {
        type: String,
        required: true,
        minlength: 25,
        maxlength: 1024
    },
    image: {
        type: String,
        default: null
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    price: {
        type: Number,
        required: true,
        min: 100,
        max: 500000
    },
    availability: {
        type: Boolean,
        default: true
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    condition: {
        type: String,
        required: true
    },
    tags: {
        type: Array
    }
}, {
    timestamps: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

productSchema.virtual('image_url').get(function () {
    var fullUrl = req.protocol + '://' + req.get('host');
    return fullUrl + '/uploads/product_images/' + this.image
});

module.exports = mongoose.model('Product', productSchema);
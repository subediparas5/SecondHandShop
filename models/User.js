const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
    },
    email: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 1024,
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
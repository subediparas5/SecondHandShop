const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    slug: String,
    sub_slug: String,
    name: String
}, { timestamps: false });

module.exports = mongoose.model('Category', categorySchema);
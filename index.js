//Packages
const express = require('express')
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
//Routes
const testRoute = require('./routes/test');
const authRoute = require('./routes/auth');
const productRoute = require("./routes/product");
const categoryRoute = require("./routes/category")
const docsRoute = require("./routes/apiDocs")
const productCommentRoute = require("./routes/productComment")
const commentReplyRoute = require("./routes/productCommentReply")
const featuredProduct = require("./routes/featuredProduct")
const adminRoute = require("./routes/admin")

dotenv.config();
app.use(fileUpload());

global.publicPath = __dirname + '/public'
app.use(function (req, res, next) {
    global.req = req;
    next();
});

app.use(express.static(__dirname + '/public'));

//@Desc connect to db
mongoose.connect(process.env.DB_CONNECT)
    .then(() => console.log("Database connected from whitelisted IP."))
    .catch((err) => {
        console.log(err);
    });

//@Desc Middleware
app.use(express.json());

//@Desc Routes Middleware
app.use('/api/test', testRoute);
app.use('/api/user', authRoute);
app.use('/api/product', productRoute);
app.use('/api/category', categoryRoute);
app.use('/', docsRoute);
app.use('/api/product', productCommentRoute);
app.use('/api/comment', commentReplyRoute);
app.use('/api/product/feature', featuredProduct);
app.use('/api/admin', adminRoute);
app.use('/api/product/feature', adminRoute);

app.listen(port, () => {
    console.log(`Server running on ${port}`);
})
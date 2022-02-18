const router = require('express').Router();

router.get('/', (request, response) => {
    response.send({
        message: "All endpoints",
        endpoint_details: [
            {
                endpoint: "/api/user/register",
                property: "POST",
                description: "Create new user.",
            },
            {
                endpoint: "/api/user/login",
                property: "POST",
                description: "Login user(Session).",
            },
            {
                endpoint: "/api/test",
                property: "GET",
                description: "Test endpoint.",
            },
            {
                endpoint: "/api/product/add",
                property: "POST",
                description: "Add a new product(Must be logged in to add).",
            },
            {
                endpoint: "/api/product/",
                property: "GET",
                description: "Get product data.",
            },
            {
                endpoint: "/api/product/:product_id",
                property: "GET",
                description: "Product Details.",
            },
            {
                endpoint: "/api/product/:product_id/update",
                property: "PUT",
                description: "Update Product Details.",
            },
            {
                endpoint: "/api/product/:product_id/delete",
                property: "DELETE",
                description: "Delete Product(Alpha).",
            },
            {
                endpoint: "/api/category/",
                property: "POST",
                description: "Create new category(Admin only feature/Must be loggen in to add).",
            },
            {
                endpoint: "/api/product/:product_id/comments",
                property: "GET",
                description: "Get all comments.",
            },
            {
                endpoint: "/api/product/:product_id/comments/add",
                property: "POST",
                description: "Add a comment.",
            },
            {
                endpoint: "/api/product/comment/:comment_id/update",
                property: "PUT",
                description: "Update a comment.",
            },
            {
                endpoint: "/api/product/comment/delete/:comment_id",
                property: "DELETE",
                description: "Delete a comment.",
            },
            {
                endpoint: "/api/comment/reply/:comment_id/add",
                property: "POST",
                description: "Add a comment reply.",
            },
            {
                endpoint: "/api/product/comment/update/:reply_id",
                property: "PUT",
                description: "Update a comment reply.",
            },
            {
                endpoint: "/api/comment/reply/delete/:reply_id",
                property: "DELETE",
                description: "Delete a comment reply.",
            },
        ]
    });
})

module.exports = router;
const router = require('express').Router();

router.get('/', (request, response) => {
    response.send({
        message: "All endpoints",
        product: [
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
                endpoint: "/api/posts",
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
                endpoint: "/api/category/",
                property: "POST",
                description: "Create new category(Admin only feature/Must be loggen in to add).",
            },
        ]
    });
})
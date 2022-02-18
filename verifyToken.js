const jwt = require('jsonwebtoken');

module.exports = function (request, response, next) {
    const token = request.header('auth-token');
    if (!token)
        return response.status(401).send({
            message: "Access Denied! Please log-in to continue"
        });
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        request.user = verified;
        next();
    } catch (err) {
        if (err.expiredAt && err.expiredAt < new Date()) {
            return response.status(400).send({
                message: 'Session Expired. Please log in again.'
            });
        }
        return response.status(400).send({
            message: 'Invalid Token'
        });
    }
}
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    try {
        let token;
        let authHeader = req.headers.Authorization || req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send({
                status: 401,
                message: "Token is require",
                error: true,
            });

        }
        if (authHeader && authHeader.startsWith("Bearer")) {
            token = authHeader.split(" ")[1];
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({
                        status: 401,
                        message: "Your are not an authorized user",
                        error: true,
                    });
        
        
                }
                req.user = decoded.user;
                next();
            });

            if (!token) {
                res.status(401);
                throw new Error("User is not authorized or token is missing");
            }
        }
    } catch (error) {
        console.log(error);
    }
}
module.exports = verifyToken;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const accessToken = (user) => {
    const token = jwt.sign(
        {
            user: {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                id: user.id,
            },
        },
        process.env.JWT_SECRET,
        { expiresIn: '15h' }
    );
    return token;
};

const decodeToken = (token) => {
    try {
        const tokenWithoutBearer = token.split(' ')[1];
        const decodedToken = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET); 
        return decodedToken;
    } catch (error) {
      return null;
    }
}

module.exports = {accessToken,decodeToken};

const jwt = require('jsonwebtoken');

const generateAccessToken = (id, email) => {
    const payload = {
        userId: id,
        email: email
    }
    return jwt.sign(payload, 'Hellouser', {expiresIn: "1h"})
}

module.exports = generateAccessToken;
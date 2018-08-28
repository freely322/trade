const jwt = require('jsonwebtoken');
const JWT_KEY = require('../config/configs.json')

module.exports = (req, res, next) => {
    try {
        let token = req.cookies.auth;
        if (token) {
            jwt.verify(token, 'secret', function(err, token_data) {
                if (err) {
                   return res.status(403).send('Error');
                } else {
                  req.user_data = token_data;
                  next();
                }
              });
        } else {
            return res.redirect('/login');
        }
    } catch (err) {
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
}
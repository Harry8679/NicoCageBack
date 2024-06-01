const asyncHandler = require('express-async-handler');

const register = asyncHandler(async (req, res) => {
    res.send('Register user');
});

module.exports = { register }
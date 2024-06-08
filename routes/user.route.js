const express = require('express');
const { register, login, logout, getUser, updateUser } = require('../controllers/user.controller');
const { protected, adminOnly, authorOnly } = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/getUser', protected, getUser);
router.put('/updateUser', protected, updateUser);

module.exports = router;
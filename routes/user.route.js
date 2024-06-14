const express = require('express');
const { register, login, logout, getUser, updateUser, deletedUser, getAllUsers, loginStatus } = require('../controllers/user.controller');
const { protected, adminOnly, authorOnly } = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/getUser', protected, getUser);
router.patch('/updateUser', protected, updateUser);
router.delete('/:id', protected, adminOnly, deletedUser);
router.get('/getAllUsers', protected, adminOnly, getAllUsers);
router.get('/loginStatus', loginStatus);

module.exports = router;
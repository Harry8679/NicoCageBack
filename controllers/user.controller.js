const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils');

const register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
        res.status(400);
        throw new Error('Veuillez renseigner tous les champs');
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (!userExists) {
        res.status(400);
        throw new Error('Cet email existe déjà');
    }

    // Create new user
    const user = await User.create({ firstName, lastName, email, password });

    // Generate Token
    const token = generateToken(user._id);

    // Send HTTP-Only cookie
    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 24 * 60 * 60),
        sameSite: 'none',
        secure: true,
    });

    if (user) {
        const { _id, firstName, lastName, email, phone, bio, photo, role, isVerified } = user;

        res.status(201).json({ _id, firstName, lastName, email, phone, bio, photo, role, isVerified, token });
    } else {
        res.status(400);
        throw new Error('Données invalides');
    }
});

module.exports = { register }
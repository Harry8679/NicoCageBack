const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const protected = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401);
            throw new Error('Vous n\'êtes pas authorisé, veuillez vous connectez !');
        }

        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // Get user id from token
        const user = await User.findById(verified.id).select('-password');
        if (!user) {
            res.status(404);
            throw new Error('Utilisateur non trouvé.')
        }

        if (user.role === 'suspended') {
            res.status(400);
            throw new Error('Utilisateur suspendu. Veuillez contacter le support.');
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401);
        throw new Error('Vous n\'êtes pas authorisé, veuillez vous connectez !');
    }
});

const adminOnly = asyncHandler(async(req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Ne sont autorisés que les admins');
    }
});

const authorOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'author' || req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('N\'est autorisés que l\'auteur');
    }
});

const verifiedOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isVerified) {
        next();
    } else {
        res.status(401);
        throw new Error('Vous n\'êtes pas autorisé, compte non vérifié');
    }
});

module.exports = { protected, adminOnly, authorOnly, verifiedOnly }
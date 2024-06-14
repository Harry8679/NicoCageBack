const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils');
let parser = require('ua-parser-js');


/* -------------------- Register -------------------- */
const register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone) {
        res.status(400);
        throw new Error('Veuillez renseigner tous les champs');
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('Cet email existe déjà');
    }

    // Get UserAgent
    const ua = parser(req.headers['user-agent']);
    const userAgent = [ua.ua];

    // Create new user
    const user = await User.create({ firstName, lastName, email, password, phone, userAgent });

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

/* -------------------- Login -------------------- */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        res.status(400);
        throw new Error('Please add email and password');
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('Utilisateur non trouvé, veuillez vous connecter.');
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (!passwordIsCorrect) {
        res.status(400);
        throw new Error('Email ou mot de passe invalide');
    }

    // Trigger 2FA for unknow UserAgent

    // Generate Token
    const token = generateToken(user._id);

    if (user && passwordIsCorrect) {
        // Send HTTP-Only cookie
        res.cookie('token', token, {
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 24 * 60 * 60),
            sameSite: 'none',
            secure: true,
        });
    const { _id, firstName, lastName, email, phone, bio, photo, role, isVerified } = user;

    res.status(200).json({ _id, firstName, lastName, email, phone, bio, photo, role, isVerified, token });
    } else {
        res.status(500);
        throw new Error('Une erreur s\'est produite. Veuillez réessayer.');
    }
});

/* -------------------- Logout -------------------- */
const logout = asyncHandler(async(req, res) => {
    res.cookie('token', '', {
        path: '/',
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'none',
        secure: true,
    });
    return res.status(200).json({ message: 'Déconnexion réussie !' });
});

/* -------------------- Profile -------------------- */
const getUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { _id, firstName, lastName, email, phone, bio, photo, role, isVerified } = user;

        res.status(200).json({ _id, firstName, lastName, email, phone, bio, photo, role, isVerified });
    } else {
        res.status(404);
        throw new Error('Utilisateur non existant.')
    }
});

/* -------------------- Update User -------------------- */
const updateUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { firstName, lastName, email, phone, bio, photo, /* role, isVerified */ } = user;

        user.firstName = req.body.firstName || firstName;
        user.lastName = req.body.lastName || lastName;
        user.email = req.body.email || email;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updatedUser = await user.save();

        res.status(200).json({ 
            _id: updatedUser._id, 
            firstName: updatedUser.firstName, 
            lastName: updatedUser.lastName, 
            email: updatedUser.email, 
            phone: updatedUser.phone, 
            bio: updatedUser.bio, 
            photo: updatedUser.photo, 
            // role: updatedUser.role, 
            // isVerified: updatedUser.isVerified 
        });
    } else {
        res.status(404);
        throw new Error('Utilisateur non existant.')
    }
});

/* -------------------- Delete User -------------------- */
const deletedUser = asyncHandler(async(req, res) => {
    
    const user = User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('Utilisateur non existant');
    }

    await user.deleteOne();

    res.status(200).json({
        message: 'Utilisateur supprimé avec succès !'
    });
});

/* -------------------- Get All Users -------------------- */
const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find().sort('-createdAt').select('-password');
    if (!users) {
        res.status(404);
        throw new Error('Une erreur s\'est produite');
    }

    res.status(200).json(users);
});

/* -------------------- Login Status -------------------- */
const loginStatus = asyncHandler(async(req, res) => {
    res.send('Login Status');
});

module.exports = { register, login, logout, getUser, updateUser, deletedUser, getAllUsers, loginStatus };
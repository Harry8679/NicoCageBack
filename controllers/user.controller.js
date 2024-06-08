const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils');
let parser = require('ua-parser-js');

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

    // Trigger 2FA (Two Factors Authentication) for unknow UserAgent
    // The User Agent (Insomnia, Postman, Chrome, Safari ...), 
    // tant qu'il n'est pas stocké en base il va renvoyer un code pour pouvoir rajouter un nouvel agent en base
    const ua = parser(req.headers['user-agent']);
    const thisUserAgent = ua.ua;
    console.log('thisUserAgent', thisUserAgent);
    const allowedAgent = user.userAgent.includes(thisUserAgent);

    if (!allowedAgent) {
        // Generate 6 digit code
        const loginCode = Math.floor(100000 + Math.random() * 900000);
        console.log('loginCode: ' + loginCode);

        // Encrypt login code before saving to DB
        const encryptedLoginCode = cryptr.encrypt(loginCode.toString());

        // Delete Token if it exists in DB
        let userToken = await Token.findOne({ userId: user._id });

        if (userToken) {
            await userToken.deleteOne();
        }

        // Save Token To DB
        await new Token({
            userId: user._id,
            lToken: encryptedLoginCode,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60 * (60 * 1000) // 1h
        }).save();

        res.status(400);
        throw new Error('New Browser or device detected');
    }

    // Generate token
    const token = generateToken(user._id);

    if (user && passwordIsCorrect) {
        // Send HTTP-Only cookie
        res.cookie('token', token, {
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 24 * 60 * 60), // 1 day
            sameSite: 'none',
            secure: true
        });

        const { _id, name, email, phone, bio, photo, role, isVerified } = user;

        res.status(200).json({ _id, name, email, phone, bio, photo, role, isVerified, token });
    } else {
        res.status(500);
        throw new Error('Something went wrong, please try again');
    }
});

module.exports = { register, login };
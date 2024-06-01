const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Veuillez renseigner votre prénom']
    },
    lastName: {
        type: String,
        required: [true, 'Veuillez renseigner votre nom']
    },
    email: {
        type: String,
        required: [true, 'Veuillez renseigner votre email'],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Veuillez renseigner un email valide',
        ],
    },
    password: {
        type: String,
        required: [true, 'Veuillez renseigner votre mot de passe']
    },
    photo: {
        type: String,
        required: [true, "Please add a photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
    phone: {
    type: String,
    default: "+33",
    },
    bio: {
    type: String,
    default: "bio",
    },
    role: {
    type: String,
    required: true,
    default: "subscriber",
    // subscriber, author, and admin (suspended)
    },
    isVerified: {
    type: Boolean,
    default: false,
    },
    userAgent: {
    type: Array,
    required: true,
    default: [],
    },
}, { 
    timestamps: true, 
    minimise: false
});

const User = mongoose.model('User', userSchema);
module.exports = User;
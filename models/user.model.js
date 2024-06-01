const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Encrypt password before saving to DB
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
})

const User = mongoose.model('User', userSchema);
module.exports = User;
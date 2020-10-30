const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ACTIVE = "ACTIVE";
const INACTIVE = "INACTIVE";
const DISABLED = "DISABLED ";

const USER = "USER";
const ADMIN = "ADMIN";

const userSchema = new Schema({
    uid: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    name: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    provider: {
        type: String,
        required: true,
        enumValues: ["email", "facebook", "gmail"],
    },
    avatar: {
        type: String
    },
    type: {
        type: String,
        required: true,
        default: USER
    },
    status: {
        type: String,
        default: ACTIVE,
        trim: true,
        enumValues: [ACTIVE, INACTIVE, DISABLED],
    },
    birthday: {
        type: Date,
        default: null
    },
    countryBirth: {
        type: String,
        default: null
    },
    countryResidence: {
        type: String,
        default: null
    },
    cityResidence: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    showProfileTo: {
        type: String,
        default: 'only_me',
        enumValues: ["all", "friends", "only_me"],
    },
    email_verification: {
        type: Date,
        default: null
    },
    trust: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
});
module.exports = mongoose.model('User', userSchema);
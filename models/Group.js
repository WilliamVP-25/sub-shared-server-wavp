const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const PENDING = "PENDING";
const APPROVED = "APPROVED";
const REJECTED = "REJECTED";
const ACTIVE = "ACTIVE ";
const INACTIVE = "ACTIVE ";

const groupSchema = new Schema({
    name: {
        type: String,
        trim: true,
    },
    code: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    description: {
        type: String,
    },
    cover: {
        type: String,
        trim: true
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    renewalFrequency: {
        type: String,
        enumValues: ['monthly', 'annual'],
    },
    acceptanceRequest: {
        type: String,
        enumValues: ['manual', 'auto'],
        default: 'auto',
    },
    relationshipType: {
        type: String,
        enumValues: ['friends', 'family', 'domestic_core', 'coworkers'],
        default: 'friends'
    },
    totalPrice: {
        type: Number
    },
    vacancy: {
        type: Number,
        min: 1,
        max: 10
    },
    status: {
        type: String,
        enumValues: [ACTIVE, INACTIVE, REJECTED, APPROVED, PENDING],
        default: PENDING
    },
    visibility: {
        type: String,
        enumValues: ['public', 'private'],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
module.exports = mongoose.model('Group', groupSchema);
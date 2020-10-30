const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    slug: {
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
    renewalFrequency: {
        type: String,
        enumValues: ['monthly', 'annual'],
        required: true
    },
    acceptanceRequest: {
        type: String,
        enumValues: ['manual', 'auto'],
        default: 'auto',
        required: true
    },
    relationshipType: {
        type: String,
        enumValues: ['friends', 'family', 'domestic_core', 'coworkers'],
        default: 'friends',
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    vacancy: {
        type: Number,
        min: 1,
        max: 4
    },

    status: {
        type: Boolean,
        default: true
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    },
    created_by: {
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
module.exports = mongoose.model('Category', categorySchema);
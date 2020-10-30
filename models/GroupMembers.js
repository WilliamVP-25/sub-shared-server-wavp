const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ACTIVE = "ACTIVE";
const PENDING = "PENDING";
const REJECTED = "REJECTED ";

const groupMembersSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    confirmCredentials: {
        type: Boolean
    },
    relationshipType: {
        type: String,
        enumValues: ['friends', 'family', 'domestic_core', 'coworkers'],
        default: 'friends'
    },
    lastPaymentDate: {
        type: Date,
        required: true
    },
    lastPaymentPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enumValues: [ACTIVE, PENDING, REJECTED],
        default: ACTIVE
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    deleted_at: {
        type: Date,
        default: Date.now()
    }
});
module.exports = mongoose.model('GroupMembers', groupMembersSchema);
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const groupCredentialsSchema = new Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    updated_at: {
        type: Date,
        default: Date.now()
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
module.exports = mongoose.model('GroupCredentials', groupCredentialsSchema);
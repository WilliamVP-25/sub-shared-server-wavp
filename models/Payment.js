const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const APPROVED = "APPROVED";
const DECLINED = "DECLINED";

const paymentSchema = new Schema({
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
    transactionId: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        required: true
    },
    transactionState: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        trim: true,
        enumValues: [APPROVED, DECLINED],
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentMethodType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    descriptionPayU: {
        type: String,
        required: true
    },
    value: {
        type: Number
    },
    currency: {
        type: String,
        required: true
    },
    tax: {
        type: Number
    },
    taxAdmin: {
        type: Number
    },
    taxAdmin2: {
        type: Number
    },
    buyerEmail: {
        type: String,
        required: true
    },
    authorizationCode: {
        type: String,
        required: true
    },
    processingDate: {
        type: Date,
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
});
module.exports = mongoose.model('Payment', paymentSchema);
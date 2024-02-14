const mongoose = require('mongoose');
const User = require('./userModel')
const Quote = require('./quotesModel')

const storeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    likes: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: User
        },
        quote_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Quote
        }
    }],
    dislikes: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: User 
        },
        quote_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Quote
        }
    }]
});

module.exports = mongoose.model('Store', storeSchema);

const mongoose = require('mongoose');
const User = require('./userModel')

const quotesSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User,
    },
    qutoes: {
        type: String,
        require: true,
    },
    like: {
        type: Number
    },
    dislike: {
        type: Number
    },
    comment: [{
        user_name:{
            type:String
        },
        comment:{
            type: String
        }
    }],
    deleted_at: {
        type: Date,
    }
},
    {
        timestamps: true
    }
)


const Qutoes = mongoose.model('quotes', quotesSchema);

module.exports = Qutoes;
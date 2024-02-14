const Quotes = require('../models/quotesModel');
const User = require('../models/userModel')

const searchQuotes = async (search, page, pageSize, limit) => {
    try {
        let query = {};
        
        if (search) {
            query = {
                $or: [
                    { qutoes: { $regex: new RegExp(search, 'i') } },
                ],
            };
        }
        const quotes = await Quotes.find(query)
            .skip((page - 1) * pageSize)
            .limit(limit || pageSize)
            .populate({ 
                path: "user_id", 
                select: "first_name last_name email" 
            });;
        return quotes;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = searchQuotes;
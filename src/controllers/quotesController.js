const express = require('express')
const tokens = require('../utils/tokenUtils');
const Qutoes = require('../models/quotesModel')
const errorHandler = require('../error/UserError')
const quotesSchema = require('../schema/quotesSchema')
const searchQuotes = require('../helpers/pagination')
const Store = require('../models/like_dislikeModel')
const http = require('http');
const app = express();

const socketIo = require('socket.io');
const User = require('../models/userModel');
const { log } = require('console');
const server = http.createServer(app);
const io = socketIo(server);

/**
 * Create qutoes
 *
 * @body Qutoes
 *
 * @returns {qutoes data}
 */

exports.qutoesCreate = async (req, res) => {
    try {
        const authHeader = tokens.decodeToken(req.headers.authorization);
        const userId = authHeader.user.id;
        const { error, value } = quotesSchema.validate(req.body)
        if (error) {
            return errorHandler.handleValidationError(error, res);
        }
        const qutoes = await Qutoes.create({
            qutoes: value.qutoes,
            user_id: userId,
            comment: null,
            like: 0,
            dislike: 0
        });
        return res.status(201).send({
            status: 201,
            message: "Qutoes created successfully.",
            error: false,
            data: qutoes,
        });
    } catch (error) {
        return errorHandler.handleValidationError(error, res);
    }
}

/**
 * Get all Qutoes
 *
 * @body 
 *
 * @returns {allQutoes}
 */

exports.allQuotes = async (req, res) => {
    try {
        const queryParams = req.query;
        let quotes;
        let totalPages;

        if (Object.keys(queryParams).length === 0) {
            quotes = await Qutoes.find().populate({
                path: "user_id",
                select: "first_name last_name email"
            });

        } else {
            const { search, page, pageSize, limit } = req.query;
            const parsedPage = parseInt(page, 10) || 1;
            const parsedPageSize = parseInt(pageSize, 10) || 5;
            const parsedLimit = parseInt(limit, 10) || undefined;

            const searchParams = await searchQuotes(search, parsedPage, parsedPageSize, parsedLimit);

            if (!searchParams) {
                return res.status(400).send({
                    status: 400,
                    message: "Search parameters are missing or invalid.",
                    error: true,
                });
            }

            quotes = searchParams;
            totalPages = Math.ceil(quotes.length / parsedPageSize);
        }
        return res.status(200).send({
            status: 200,
            message: "Quotes retrieved successfully.",
            error: false,
            data: quotes,
            totalPages: totalPages
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            status: 500,
            message: "Internal server error.",
            error: true,
        });
    }
};



/**
 * Delete a quote
 *
 * @param {string} req.params.id
 * @authorization {string} req.user.id
 *
 * @returns {Object} Response indicating success or failure
 */
exports.deleteQutoes = async (req, res) => {
    try {
        const quoteId = req.params.id;
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (user.isAdmin) {
            const quote = await Qutoes.findOne({ _id: quoteId });
            await quote.deleteOne()
            return res.status(200).send({
                status: 200,
                message: "Quote deleted successfully.",
                error: false,
            });
        }
        const quote = await Qutoes.findOne({ _id: quoteId, user_id: userId });
        if (!quote) {
            return res.status(404).send({
                status: 404,
                message: "Quote not found.",
                error: true,
            });
        }
        await quote.deleteOne()

        return res.status(200).send({
            status: 200,
            message: "Quote deleted successfully.",
            error: false,
        });
    } catch (error) {
        console.log(error);
        return errorHandler.handleValidationError(error, res);
    }
}

/**
 * Delete a User
 *
 * @param {string} req.params.id
 * @authorization {string} req.user.id
 *
 * @returns {Object} Response indicating success or failure
 */
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const users = await User.findById(userId);
        if (users.isAdmin) {
            const quote = await Qutoes.findOne({ user_id: userId });
            const Users = await User.findOne({ _id: userId });
            await quote.deleteOne()
            await Users.deleteOne()
            return res.status(200).send({
                status: 200,
                message: "User deleted successfully.",
                error: false,
            });
        }
        const Users = await User.findByIdAndDelete({ user_id: userId });
        const quote = await Qutoes.findByIdAndDelete({user_id: userId });
        return res.status(200).send({
            status: 200,
            message: "Quote deleted successfully.",
            error: false,
        });
    } catch (error) {
        console.log(error);
        return errorHandler.handleValidationError(error, res);
    }
}



/**
 * Post comments
 *
 * @params qutoes._id,
 * @body comments
 * @returns {qutoes and comments}
 */
exports.commentCreate = async (req, res) => {
    try {
        let userId = null;
        let userFound = null;

        if (req.headers.authorization) {
            const decodedToken = tokens.decodeToken(req.headers.authorization);
            userId = decodedToken.user.id;
            userFound = await User.findById(userId);
        } else {
            userId = null;
            userFound = "anonymous";
        }

        console.log(userFound?.first_name);

        const quoteId = req.params.id;
        const commentText = req.body.comment;
        let quote = await Qutoes.findById(quoteId);

        if (!quote) {
            return res.status(404).send({
                status: 404,
                message: "Quote not found.",
                error: true,
            });
        }
        if (quote.comment === null) {
            quote.comment = [];
        }

        quote.comment.push({ user_name: userFound.first_name, comment: commentText });

        quote = await quote.save();
        const data = {
            like: quote.like,
            dislike: quote.dislike,
            comment: quote.comment.map(comment => {
                return {
                    user_name: comment.user_name,
                    comment: comment.comment
                };
            })
        };


        return res.status(201).send({
            status: 201,
            message: "Comment added successfully.",
            error: false,
            data: data,
        });
    } catch (error) {
        console.log(error);
        return errorHandler.handleValidationError(error, res);
    }
}


/**
 * Get quote by ID
 *
 * @params id - Quote ID
 *
 * @returns {quote} - Quote object
 */
exports.getQuoteById = async (req, res) => {
    try {
        const quoteId = req.params.id;
        const quote = await Qutoes.findById(quoteId);

        if (!quote) {
            return res.status(404).json({
                status: 404,
                message: "Quote not found",
                error: true,
                data: null
            });
        }

        res.render('quote', {
            quoteId: quote._id,
            quoteText: quote.text,
            likeCount: quote.like,
            dislikeCount: quote.dislike
        }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: true,
            data: null
        });
    }
};

/**
 * Realtime like
 *
 * @params qutoes._id
 *
 * @returns {username, like_count, dislike_count}
 */


exports.like = async (req, res) => {
    try {
        const user_id = "65cb40f48ae8d618d5eee465";
        const quote_id = req.params.id;
        console.log(user_id);
        const dislikeExists = await Store.exists({ 'dislikes.user_id': user_id, 'dislikes.quote_id': quote_id });
        if (dislikeExists) {
            await Store.updateOne({ 'dislikes.user_id': user_id, 'dislikes.quote_id': quote_id }, { $pull: { dislikes: { user_id, quote_id } } });
            await Qutoes.findOneAndUpdate({ _id: quote_id }, { $inc: { dislike: -1 } });
        }
        const likeExists = await Store.exists({ 'likes.user_id': user_id, 'likes.quote_id': quote_id });
        if (!likeExists) {
            await Store.updateOne({ user_id: user_id }, { $push: { likes: { user_id, quote_id } } }, { upsert: true });
            await Qutoes.findOneAndUpdate({ _id: quote_id }, { $inc: { like: 1 } });
        } else {
            return res.status(200).json({
                status: 200,
                message: "Already like this qutoes",
                error: false,
                data: [],
            });
        }

        const data = await Qutoes.findOne({ _id: quote_id });
        const filterData = [{
            user: "dipika",
            like: data.like,
            dislike: data.dislike
        }]
        io.emit('like', { quote_id: quote_id, like_count: data.like });
        
        res.status(200).json({
            status: 200,
            message: "Like added successfully",
            error: false,
            data: data.like,
        });    } catch (error) {
        console.log(error);
        return errorHandler.handleValidationError(error, res);
    }
}


/**
 * Realtime dislike
 *
 * @params qutoes._id
 *
 * @returns {username, like_count, dislike_count}
 */

exports.dislike = async (req, res) => {
    try {
        const user_id = "65cb40f48ae8d618d5eee465";
        const quote_id = req.params.id;
        const likeExists = await Store.exists({ 'likes.user_id': user_id, 'likes.quote_id': quote_id });
        if (likeExists) {
            await Store.updateOne({ 'likes.user_id': user_id, 'likes.quote_id': quote_id }, { $pull: { likes: { user_id, quote_id } } });
            await Qutoes.findOneAndUpdate({ _id: quote_id }, { $inc: { like: -1 } });
        }
        const dislikeExists = await Store.exists({ 'dislikes.user_id': user_id, 'dislikes.quote_id': quote_id });
        if (!dislikeExists) {
            await Store.updateOne({ user_id: user_id }, { $push: { dislikes: { user_id, quote_id } } }, { upsert: true });
            await Qutoes.findOneAndUpdate({ _id: quote_id }, { $inc: { dislike: 1 } });
        } else {
            return res.status(200).json({
                status: 200,
                message: "Already dislike this qutoes",
                error: false,
                data: [],
            });
        }

        const data = await Qutoes.findOne({ _id: quote_id });
        const filterData = [{
            user: "dipika",
            like: data.like,
            dislike: data.dislike
        }]
        io.emit('dislike', { quote_id: quote_id, dislike_count: data.dislike });
        res.status(200).json({
            status: 200,
            message: "Dislike added successfully",
            error: false,
            data: filterData,
        });
    } catch (error) {
        console.log(error);
        return errorHandler.handleValidationError(error, res);
    }
}
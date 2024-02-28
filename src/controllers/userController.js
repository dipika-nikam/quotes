const express = require('express')
const User = require('../models/userModel')
const tokens = require('../utils/tokenUtils');
const errorHandler = require('../error/UserError')
const Schemavalidation = require('../schema/userSchema')
const PasswordValidate = require("../utils/PasswordUtils");
const Sendmail = require('../helpers/sendMail')

/**
 * Register a user
 *
 * @body first_name, last_name, email, password
 *
 * @returns {first_name, last_name, email, password, isAdmin, createdAt, updatedAt}
 */

exports.userRegister = async (req, res) => {
    try {
        const { error, value } = Schemavalidation.validate(req.body);
        if (error) {
            return errorHandler.handleValidationError(error, res);
        }
        const hashedPassword = await PasswordValidate.hashPassword(value.password);
        const isAdmin = value.isAdmin || false;
        const user = await User.create({
            username: value.username,
            email: value.email,
            password: hashedPassword,
            isAdmin: isAdmin
        });
        const { password, ...newUser } = user.toObject();

        return res.status(201).send({
            status: 201,
            message: "User has been successfully created",
            error: false,
            data: newUser,
        });
    } catch (error) {
        console.log(error);
        return errorHandler.handleValidationError(error, res)
    }
}

/**
 * Login a user
 *
 * @body email, password
 *
 * @returns {User, token}
 */

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email){
            return res.status(400).json({
                status: 400,
                message: "Enter email for login.",
                error: true,
                data: {},
            });
        }else if(!password){
            return res.status(400).json({
                status: 400,
                message: "Enter password for login.",
                error: true,
                data: {},
            });
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Enter required fields.",
                error: true,
                data: {},
            });
        }
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({
                status: 404,
                message: "User not found",
                error: true,
                data: {},
            });
        }
        const isPasswordValid = await PasswordValidate.comparePasswords(
            password,
            user.password
        );
        if (!isPasswordValid) {
            return res.status(404).send({
                status: 404,
                message: "Invalid password",
                error: true,
                data: {},
            });
        }
        let JWTtokens = tokens.accessToken(user);
        await user.save(user.token = JWTtokens);
        return res.status(200).send({
            status: 200,
            message: "Logged in successfully",
            error: false,
            data: {
                email: email,
                token: JWTtokens
            }
        })
    } catch (error) {
        return errorHandler.handleValidationError(error, res)
    }
}


/**
 * Update a user
 *
 * @body first_name, last_name, email
 *
 * @returns {User}
 */

exports.updatedUser = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Enter required fields.",
                error: true,
                data: {},
            });
        }
        const decodedToken = tokens.decodeToken(req.headers.authorization);
        const userId = decodedToken.user.id;
        const userFound = await User.findById(userId);
        if (!userFound) {
            return res.status(404).send({
                status: 404,
                message: 'User not found',
                error: true,
                data: {}
            });
        }
        const value = req.body;
        if (!value) {   
            return res.status(400).send({
                status: 400,
                message: 'Value is required for update',
                error: true,
                data: {}
            });
        }
        if (value.password) {
            res.status(401).send({
                status: 401,
                message: "You can't change password from here.",
                error: true,
                data: {}
            })
        }
        const updatedUser = await User.findByIdAndUpdate(userId, value, {
            new: true,
            runValidators: true,
        });
        const responseUser = { ...updatedUser.toObject() };
        delete responseUser.password;
        res.status(200).send({
            success: true,
            message: 'User updated successfully',
            error: false,
            data: responseUser,
        });
    } catch (error) {
        return errorHandler.handleValidationError(error, res)
    }
}

/**
 * Send link for change password
 *
 * @body email
 *
 * @returns {Userlink}
 */

exports.forgotPasswordlink = async (req, res) => {
    try {
        const  email  = 'test1@gmail.com';
        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
            return res.status(404).send({
                status: 404,
                message: 'User not found',
                error: true,
                data: {}
            });
        }
        const resetToken = user.token;
        user.resetToken = resetToken;
        await user.save();
        Sendmail(user.email, resetToken);
        console.log();
        return res.status(200).send({
            status: 200,
            message: 'Password reset link send on your email',
            error: true,
            data: {}
        });

    } catch (error) {
        return errorHandler.handleValidationError(error, res)
    }
}

/**
 * Change password
 *
 * @body newpassword, confirmpassword 
 *
 * @returns {Password change}
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            return res.status(404).send({
                status: 404,
                message: "Your confirm password doesn't match with new password",
                error: true,
                data: {},
            });
        }
        const decodedToken = tokens.decodeToken(req.headers.authorization);
        const userId = decodedToken.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({
                status: 404,
                message: "User not found",
                error: true,
                data: {},
            });
        }
        const hashedNewPassword = await PasswordValidate.hashPassword(newPassword);
        user.password = hashedNewPassword;
        user.token = req.headers.authorization;
        await user.save();
        return res.status(200).send({
            status: 200,
            message: "Password change successfully",
            error: true,
            data: {},
        });
    } catch (error) {
        console.log(error);
        return errorHandler.handleValidationError(error, res)
    }
}

/**
 * Logout user
 *
 * @token user login token  
 *
 * @returns {message}
 */

exports.userLogout = async (req, res) => {
    try {
        const decodedToken = tokens.decodeToken(req.headers.authorization);
        if (!decodedToken || !decodedToken.user || !decodedToken.user.id) {
            return res.status(400).json({ message: "Invalid token" });
        }
        const userId = decodedToken.user.id;
        await User.findByIdAndUpdate(userId, { $unset: { token: "" } });
        return res.status(200).send({
            status: 200,
            message: "Logout successfully",
            error: false,
            data: {},
        });
    } catch (error) {
        return errorHandler.handleValidationError(error, res)
    }
}
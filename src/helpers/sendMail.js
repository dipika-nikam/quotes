const { text } = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();


const sendResetPasswordEmail = (email, resetToken) => {
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: "bec4c527638753",
                pass: "bf8fa20348bab2",
            },
        });
        const resetLink = `http://localhost:8000/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: 'dipika.infynno@gmail.com',
            to: email,
            subject: 'Reset Your Password',
            text: `Click the following link to reset your password: http://localhost:8000/reset-password?token=${resetToken}`,
            html: `<p>Click the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
        };
        try {
            transporter.sendMail(mailOptions);
            console.log('Reset password email sent successfully');
        } catch (error) {
            console.error('Error sending reset password email:', error);
        }
    }catch(error){
        console.error('Error sending reset password email:', error);
    }
}

module.exports = sendResetPasswordEmail
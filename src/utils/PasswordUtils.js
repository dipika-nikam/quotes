const bcrypt = require("bcrypt")

exports.hashPassword = async (password)=> {
    return bcrypt.hash(password, 10);
  };

exports.comparePasswords = async (password, hashedPassword)=> {
    return bcrypt.compare(password, hashedPassword);
  };
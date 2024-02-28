const bcrypt = require("bcrypt")
exports.hashPassword = async (password)=> {
  try {
      console.log("Generating salt...");
      const salt = await bcrypt.genSalt(10);
      console.log("Salt generated:", salt);
      console.log("Password received:", password);
      const hashedPassword = await bcrypt.hashSync(password, salt);
      console.log("Password hashed:", hashedPassword);
      return hashedPassword;
  } catch (error) {
      console.error("Error hashing password:", error);
      throw error;
  }
};

exports.comparePasswords = async (password, hashedPassword)=> {
    return bcrypt.compare(password, hashedPassword);
  };
const bcrypt = require('bcrypt');

/**
 * Gets unencrypted password. Returns the password encrypted
 * @param {*} password 
 * @returns 
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/**
 * Gets unencrypted password and the encrypted password.
 * @param {*} inputPassword 
 * @param {*} storedPassword 
 * @returns 
 */
const comparePassword = async (inputPassword, storedPassword) => {
    return await bcrypt.compare(inputPassword, storedPassword);
};

module.exports = { hashPassword, comparePassword };

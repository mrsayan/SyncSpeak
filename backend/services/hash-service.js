const crypto = require('crypto');

/**
 * A class representing a hash service.
 * @class
 */
class HashService {
    /**
     * Hashes the given data using SHA256 algorithm and a secret key.
     * @param {string} data - The data to be hashed.
     * @returns {string} The hashed data in hexadecimal format.
     */
    hashOtp(data) {
        return crypto
            .createHmac('sha256', process.env.HASH_SECRET)
            .update(data)
            .digest('hex');
    }
}

module.exports = new HashService();

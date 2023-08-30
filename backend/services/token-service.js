const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
const refreshModel = require('../models/refresh-model');

/**
 * TokenService class that provides methods for generating, storing, verifying, and removing tokens.
 */
class TokenService {
    /**
     * Generates access and refresh tokens for the given payload.
     * @param {Object} payload - The payload to be included in the tokens.
     * @returns {Object} - An object containing the access and refresh tokens.
     */
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, accessTokenSecret, {
            expiresIn: '1m',
        });
        const refreshToken = jwt.sign(payload, refreshTokenSecret, {
            expiresIn: '1y',
        });
        return { accessToken, refreshToken };
    }

    /**
     * Stores the given refresh token and user ID in the database.
     * @param {string} token - The refresh token to be stored.
     * @param {string} userId - The ID of the user associated with the token.
     */
    async storeRefreshToken(token, userId) {
        try {
            await refreshModel.create({
                token,
                userId,
            });
        } catch (err) {
            console.log(err.message);
        }
    }

    /**
     * Verifies the given access token.
     * @param {string} token - The access token to be verified.
     * @returns {Object} - The decoded payload of the token.
     */
    async verifyAccessToken(token) {
        return jwt.verify(token, accessTokenSecret);
    }

    /**
     * Verifies the given refresh token.
     * @param {string} refreshToken - The refresh token to be verified.
     * @returns {Object} - The decoded payload of the token.
     */
    async verifyRefreshToken(refreshToken) {
        return jwt.verify(refreshToken, refreshTokenSecret);
    }

    /**
     * Finds a refresh token in the database for the given user ID and token.
     * @param {string} userId - The ID of the user associated with the token.
     * @param {string} refreshToken - The refresh token to be found.
     * @returns {Object} - The refresh token object from the database.
     */
    async findRefreshToken(userId, refreshToken) {
        return await refreshModel.findOne({
            userId: userId,
            token: refreshToken,
        });
    }

    /**
     * Updates the refresh token in the database for the given user ID.
     * @param {string} userId - The ID of the user associated with the token.
     * @param {string} refreshToken - The new refresh token to be stored.
     * @returns {Object} - The updated refresh token object from the database.
     */
    async updateRefreshToken(userId, refreshToken) {
        return await refreshModel.updateOne(
            { userId: userId },
            { token: refreshToken }
        );
    }

    /**
     * Removes the given refresh token from the database.
     * @param {string} refreshToken - The refresh token to be removed.
     * @returns {Object} - The result of the delete operation.
     */
    async removeToken(refreshToken) {
        return await refreshModel.deleteOne({ token: refreshToken });
    }
}

module.exports = new TokenService();

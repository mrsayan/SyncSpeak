const UserModel = require('../models/user-model');

/**
 * A class representing a user service.
 * @class
 */
class UserService {
    /**
     * Finds a user based on the provided filter.
     * @async
     * @function
     * @param {Object} filter - The filter to apply when searching for a user.
     * @returns {Promise<Object>} - A promise that resolves with the found user object.
     */
    async findUser(filter) {
        const user = await UserModel.findOne(filter);
        return user;
    }

    /**
     * Creates a new user with the provided data.
     * @async
     * @function
     * @param {Object} data - The data to use when creating the new user.
     * @returns {Promise<Object>} - A promise that resolves with the created user object.
     */
    async createUser(data) {
        const user = await UserModel.create(data);
        return user;
    }
}

module.exports = new UserService();

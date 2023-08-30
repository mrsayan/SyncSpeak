const RoomModel = require('../models/room-model');

/**
 * A service class for managing rooms.
 */
class RoomService {

    /**
     * Creates a new room.
     * @param {Object} payload - The payload for creating a new room.
     * @param {string} payload.topic - The topic of the room.
     * @param {string} payload.roomType - The type of the room.
     * @param {string} payload.ownerId - The ID of the owner of the room.
     * @returns {Promise<Object>} - A promise that resolves to the newly created room.
     */
    async create(payload) {
        const { topic, roomType, ownerId } = payload;
        const room = await RoomModel.create({
            topic,
            roomType,
            ownerId,
            speakers: [ownerId],
        });
        return room;
    }

    /**
     * Gets all rooms of the specified types.
     * @param {Array<string>} types - An array of room types to filter by.
     * @returns {Promise<Array<Object>>} - A promise that resolves to an array of rooms.
     */
    async getAllRooms(types) {
        const rooms = await RoomModel.find({ roomType: { $in: types } })
            .populate('speakers')
            .populate('ownerId')
            .exec();
        return rooms;
    }

    /**
     * Gets a room by ID.
     * @param {string} roomId - The ID of the room to get.
     * @returns {Promise<Object>} - A promise that resolves to the room with the specified ID.
     */
    async getRoom(roomId) {
        const room = await RoomModel.findOne({ _id: roomId });
        return room;
    }
}

module.exports = new RoomService();

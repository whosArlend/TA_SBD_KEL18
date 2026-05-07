import * as roomService from './room.service.js';

export const getRooms = async (req, res) => {
    try {
        const rooms = await roomService.getAllRooms();
        return res.status(200).json({
            success: true,
            data: rooms
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
};

export const getRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await roomService.getRoomById(id);
        return res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        const statusCode = error.message === 'Room not found' ? 404 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
};

export const createRoom = async (req, res) => {
    try {
        const roomData = req.body;
        const newRoom = await roomService.createNewRoom(roomData);
        return res.status(201).json({
            success: true,
            message: 'Room created successfully',
            data: newRoom
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to create room'
        });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const roomData = req.body;
        const updatedRoom = await roomService.editRoom(id, roomData);
        return res.status(200).json({
            success: true,
            message: 'Room updated successfully',
            data: updatedRoom
        });
    } catch (error) {
        const statusCode = error.message === 'Room not found' ? 404 : 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to update room'
        });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        await roomService.removeRoom(id);
        return res.status(200).json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        const statusCode = error.message === 'Room not found' ? 404 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to delete room'
        });
    }
};

export const archiveRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const archivedRoom = await roomService.archiveRoom(id, reason);
        return res.status(200).json({
            success: true,
            message: 'Room archived successfully',
            data: archivedRoom
        });
    } catch (error) {
        const statusCode = error.message === 'Room not found' ? 404 : 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to archive room'
        });
    }
};

export const unarchiveRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const unarchivedRoom = await roomService.unarchiveRoom(id);
        return res.status(200).json({
            success: true,
            message: 'Room unarchived successfully',
            data: unarchivedRoom
        });
    } catch (error) {
        const statusCode = error.message === 'Room not found' ? 404 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to unarchive room'
        });
    }
};

export const updateRoomAmenities = async (req, res) => {
    try {
        const { id } = req.params;
        const { amenity_ids } = req.body; // array of { amenity_id, quantity }
        await roomService.setRoomAmenities(id, amenity_ids ?? []);
        return res.status(200).json({ success: true, message: 'Amenities updated' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const updateRoomRules = async (req, res) => {
    try {
        const { id } = req.params;
        const { rule_ids } = req.body; // array of rule_id numbers
        await roomService.setRoomRules(id, rule_ids ?? []);
        return res.status(200).json({ success: true, message: 'Rules updated' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

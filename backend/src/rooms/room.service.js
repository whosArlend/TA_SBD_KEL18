import * as roomRepo from './room.repository.js';

export const getAllRooms = async () => {
    return await roomRepo.findAllRooms();
};

export const getRoomById = async (roomId) => {
    const room = await roomRepo.findRoomById(roomId);
    if (!room) {
        throw new Error('Room not found');
    }
    return room;
};

export const createNewRoom = async (roomData) => {
    // Validasi basic menggunakan lowercase
    if (!roomData.room_name) {
        throw new Error('room_name is required');
    }

    // Set default value if status not provided
    if (!roomData.status) {
        roomData.status = 'Available';
    }

    return await roomRepo.createRoom(roomData);
};

export const editRoom = async (roomId, roomData) => {
    // Validasi eksistensi data
    await getRoomById(roomId); 

    // Tidak boleh update ID atau created_at
    delete roomData.room_id;
    delete roomData.created_at;

    return await roomRepo.updateRoom(roomId, roomData);
};

export const removeRoom = async (roomId) => {
    await getRoomById(roomId); 
    return await roomRepo.deleteRoom(roomId);
};

export const archiveRoom = async (roomId, reason) => {
    if (!reason) {
        throw new Error('Archive reason is required');
    }
    await getRoomById(roomId);
    return await roomRepo.archiveRoom(roomId, reason);
};

export const unarchiveRoom = async (roomId) => {
    await getRoomById(roomId);
    return await roomRepo.unarchiveRoom(roomId);
};

export const setRoomAmenities = async (roomId, amenityIds) => {
    await getRoomById(roomId);
    return await roomRepo.replaceRoomAmenities(roomId, amenityIds);
};

export const setRoomRules = async (roomId, ruleIds) => {
    await getRoomById(roomId);
    return await roomRepo.replaceRoomRules(roomId, ruleIds);
};

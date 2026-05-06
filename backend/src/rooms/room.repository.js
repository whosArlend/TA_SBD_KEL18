import { supabase } from '../lib/supabase.js';

/**
 * Get all active rooms (not deleted)
 */
export const findAllRooms = async () => {
    const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Supabase Error (findAllRooms):', error);
        throw error;
    }
    return data;
};

/**
 * Get a specific room by ID
 */
export const findRoomById = async (roomId) => {
    const { data, error } = await supabase
        .from('rooms')
        .select(`
            *,
            room_amenities_map (
                quantity,
                amenities ( amenity_id, amenity_name )
            ),
            room_rules_map (
                rules ( rule_id, rule_name )
            )
        `)
        .eq('room_id', roomId)
        .is('deleted_at', null)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Supabase Error (findRoomById):', error);
        throw error;
    }
    return data;
};

/**
 * Create a new room
 */
export const createRoom = async (roomData) => {
    const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
        .single();

    if (error) {
        console.error('Supabase Error (createRoom):', error);
        throw error;
    }
    return data;
};

/**
 * Update an existing room
 */
export const updateRoom = async (roomId, roomData) => {
    const { data, error } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('room_id', roomId)
        .select()
        .single();

    if (error) {
        console.error('Supabase Error (updateRoom):', error);
        throw error;
    }
    return data;
};

/**
 * Soft delete a room
 */
export const deleteRoom = async (roomId) => {
    const { data, error } = await supabase
        .from('rooms')
        .update({ deleted_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .select()
        .single();

    if (error) {
        console.error('Supabase Error (deleteRoom):', error);
        throw error;
    }
    return data;
};

/**
 * Archive a room
 */
export const archiveRoom = async (roomId, reason) => {
    const { data, error } = await supabase
        .from('rooms')
        .update({ 
            archived_at: new Date().toISOString(), 
            archive_reason: reason,
            status: 'Maintenance'
        })
        .eq('room_id', roomId)
        .select()
        .single();

    if (error) {
        console.error('Supabase Error (archiveRoom):', error);
        throw error;
    }
    return data;
};
/**
 * Unarchive a room
 */
export const unarchiveRoom = async (roomId) => {
    const { data, error } = await supabase
        .from('rooms')
        .update({ 
            archived_at: null, 
            archive_reason: null,
            status: 'Available'
        })
        .eq('room_id', roomId)
        .select()
        .single();

    if (error) {
        console.error('Supabase Error (unarchiveRoom):', error);
        throw error;
    }
    return data;
};

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
 * Permanently delete a room and its related mappings
 */
export const deleteRoom = async (roomId) => {
    // Delete related mappings first to avoid FK constraint errors
    await supabase.from('room_amenities_map').delete().eq('room_id', roomId);
    await supabase.from('room_rules_map').delete().eq('room_id', roomId);

    const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('room_id', roomId);

    if (error) {
        console.error('Supabase Error (deleteRoom):', error);
        throw error;
    }
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

/**
 * Replace all amenities for a room
 * amenityIds: array of { amenity_id, quantity }
 */
export const replaceRoomAmenities = async (roomId, amenityIds) => {
    // Delete existing
    const { error: delError } = await supabase
        .from('room_amenities_map')
        .delete()
        .eq('room_id', roomId);
    if (delError) throw delError;

    if (!amenityIds || amenityIds.length === 0) return;

    const rows = amenityIds.map(({ amenity_id, quantity }) => ({
        room_id: roomId,
        amenity_id,
        quantity: quantity ?? 1,
    }));
    const { error } = await supabase.from('room_amenities_map').insert(rows);
    if (error) throw error;
};

/**
 * Replace all rules for a room
 * ruleIds: array of rule_id numbers
 */
export const replaceRoomRules = async (roomId, ruleIds) => {
    const { error: delError } = await supabase
        .from('room_rules_map')
        .delete()
        .eq('room_id', roomId);
    if (delError) throw delError;

    if (!ruleIds || ruleIds.length === 0) return;

    const rows = ruleIds.map((rule_id) => ({ room_id: roomId, rule_id }));
    const { error } = await supabase.from('room_rules_map').insert(rows);
    if (error) throw error;
};

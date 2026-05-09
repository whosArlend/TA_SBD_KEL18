import { supabaseAdmin as supabase } from '../lib/supabase-admin.js';

/**
 * Get all active reservations with optional filters
 */
export const findAllReservations = async (filters = {}) => {
    let query = supabase
        .from('reservations')
        .select(`
            *,
            users ( user_id, full_name, email, department ),
            rooms ( room_id, room_name, room_type, location, capacity )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (filters.status) {
        query = query.eq('status', filters.status);
    }
    if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
    }
    if (filters.room_id) {
        query = query.eq('room_id', filters.room_id);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Supabase Error (findAllReservations):', error);
        throw error;
    }
    return data;
};

/**
 * Get a specific reservation by ID
 */
export const findReservationById = async (reservationId) => {
    const { data, error } = await supabase
        .from('reservations')
        .select(`
            *,
            users ( user_id, full_name, email, department ),
            rooms ( room_id, room_name, room_type, location, capacity )
        `)
        .eq('reservation_id', reservationId)
        .is('deleted_at', null)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Supabase Error (findReservationById):', error);
        throw error;
    }
    return data;
};

/**
 * Check for overlapping reservations on a room within a time window.
 * Excludes a specific reservation ID (used when updating).
 */
export const findOverlappingReservations = async (roomId, startTime, endTime, excludeId = null) => {
    let query = supabase
        .from('reservations')
        .select('reservation_id, booking_code, start_time, end_time, status')
        .eq('room_id', roomId)
        .in('status', ['Pending', 'Approved'])
        .is('deleted_at', null)
        .lt('start_time', endTime)   // existing.start_time < new end_time
        .gt('end_time', startTime);  // existing.end_time   > new start_time

    if (excludeId) {
        query = query.neq('reservation_id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Supabase Error (findOverlappingReservations):', error);
        throw error;
    }
    return data;
};

/**
 * Create a new reservation
 */
export const createReservation = async (reservationData) => {
    const { data, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select(`
            *,
            users ( user_id, full_name, email, department ),
            rooms ( room_id, room_name, room_type, location, capacity )
        `)
        .single();

    if (error) {
        console.error('Supabase Error (createReservation):', error);
        throw error;
    }
    return data;
};

/**
 * Update an existing reservation
 */
export const updateReservation = async (reservationId, reservationData) => {
    const { data, error } = await supabase
        .from('reservations')
        .update(reservationData)
        .eq('reservation_id', reservationId)
        .select(`
            *,
            users ( user_id, full_name, email, department ),
            rooms ( room_id, room_name, room_type, location, capacity )
        `)
        .single();

    if (error) {
        console.error('Supabase Error (updateReservation):', error);
        throw error;
    }
    return data;
};

/**
 * Soft delete a reservation
 */
export const deleteReservation = async (reservationId) => {
    const { data, error } = await supabase
        .from('reservations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('reservation_id', reservationId)
        .select()
        .single();

    if (error) {
        console.error('Supabase Error (deleteReservation):', error);
        throw error;
    }
    return data;
};

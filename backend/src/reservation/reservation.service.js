import * as reservationRepo from './reservation.repository.js';
import * as roomRepo from '../rooms/room.repository.js';

const VALID_STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

const generateBookingCode = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TKSRB-${dateStr}-${random}`;
};

export const getAllReservations = async (filters) => {
    return await reservationRepo.findAllReservations(filters);
};

export const getReservationById = async (reservationId) => {
    const reservation = await reservationRepo.findReservationById(reservationId);
    if (!reservation) {
        throw new Error('Reservation not found');
    }
    return reservation;
};

export const createNewReservation = async (reservationData) => {
    const { user_id, room_id, start_time, end_time, meeting_title, person_in_charge } = reservationData;

    if (!user_id) throw new Error('user_id is required');
    if (!room_id) throw new Error('room_id is required');
    if (!start_time) throw new Error('start_time is required');
    if (!end_time) throw new Error('end_time is required');
    if (!meeting_title) throw new Error('meeting_title is required');
    if (!person_in_charge) throw new Error('person_in_charge is required');

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('start_time and end_time must be valid datetime values');
    }
    if (start >= end) {
        throw new Error('start_time must be before end_time');
    }

    const conflicts = await reservationRepo.findOverlappingReservations(room_id, start_time, end_time);
    if (conflicts.length > 0) {
        throw new Error('Room is already booked for the selected time slot');
    }

    const payload = {
        user_id,
        room_id,
        start_time,
        end_time,
        meeting_title,
        person_in_charge,
        status: 'Pending',
        booking_code: generateBookingCode(),
    };

    return await reservationRepo.createReservation(payload);
};

export const editReservation = async (reservationId, reservationData) => {
    const existing = await getReservationById(reservationId);

    if (existing.status !== 'Pending') {
        throw new Error('Only reservations with Pending status can be edited');
    }

    // Immutable fields
    delete reservationData.reservation_id;
    delete reservationData.booking_code;
    delete reservationData.status;
    delete reservationData.created_at;
    delete reservationData.deleted_at;

    const start_time = reservationData.start_time ?? existing.start_time;
    const end_time = reservationData.end_time ?? existing.end_time;
    const room_id = reservationData.room_id ?? existing.room_id;

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (start >= end) {
        throw new Error('start_time must be before end_time');
    }
    if (start <= new Date()) {
        throw new Error('start_time must be in the future');
    }

    const conflicts = await reservationRepo.findOverlappingReservations(room_id, start_time, end_time, reservationId);
    if (conflicts.length > 0) {
        throw new Error('Room is already booked for the selected time slot');
    }

    return await reservationRepo.updateReservation(reservationId, reservationData);
};

export const updateReservationStatus = async (reservationId, { status, notes_from_admin }) => {
    const reservation = await getReservationById(reservationId);

    if (!status) throw new Error('status is required');
    if (!VALID_STATUSES.includes(status)) {
        throw new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const payload = { status };
    if (notes_from_admin !== undefined) {
        payload.notes_from_admin = notes_from_admin;
    }

    const updated = await reservationRepo.updateReservation(reservationId, payload);

    // Update status ruangan sesuai hasil keputusan reservasi
    if (status === 'Approved') {
        await roomRepo.updateRoom(reservation.room_id, { status: 'Occupied' });
    } else if (status === 'Rejected') {
        await roomRepo.updateRoom(reservation.room_id, { status: 'Available' });
    }

    return updated;
};

export const cancelReservation = async (reservationId) => {
    const existing = await getReservationById(reservationId);

    const cancellableStatuses = ['Pending', 'Approved'];
    if (!cancellableStatuses.includes(existing.status)) {
        throw new Error(`Cannot cancel a reservation with status '${existing.status}'`);
    }

    const cancelled = await reservationRepo.updateReservation(reservationId, { status: 'Cancelled' });
    await roomRepo.updateRoom(existing.room_id, { status: 'Available' });
    return cancelled;
};

export const removeReservation = async (reservationId) => {
    await getReservationById(reservationId);
    return await reservationRepo.deleteReservation(reservationId);
};

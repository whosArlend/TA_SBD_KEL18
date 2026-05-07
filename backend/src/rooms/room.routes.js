import express from 'express';
import * as roomController from './room.controller.js';

const router = express.Router();

router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoom);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);
router.patch('/:id/archive', roomController.archiveRoom);
router.patch('/:id/unarchive', roomController.unarchiveRoom);
router.put('/:id/amenities', roomController.updateRoomAmenities);
router.put('/:id/rules', roomController.updateRoomRules);

export default router;

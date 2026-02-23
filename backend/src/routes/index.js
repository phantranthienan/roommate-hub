import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import roomsRoutes from '../modules/rooms/rooms.routes.js';
import { guestsRoutes } from '../modules/guests/guests.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomsRoutes);
router.use('/guests', guestsRoutes);

export default router;

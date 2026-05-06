// backend/index.js
import express from 'express';
import cors from 'cors';
import authRoutes from './auth/auth.routes.js';
import roomRoutes from './rooms/room.routes.js';
import reservationRoutes from './reservation/reservation.routes.js';
import uploadRoutes from './upload/upload.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/upload', uploadRoutes);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
}

export default app;
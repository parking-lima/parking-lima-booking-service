
import express from 'express';
import healthRoutes from './routes/health.routes.js';
import { createPool } from './db/pool.js';
import { createBookingRepository } from './repositories/booking.repository.js';
import { createBookingService } from './services/booking.service.js';
import { createBookingRoutes } from './routes/booking.routes.js';

export function createApp({ bookingService } = {}) {
  const app = express();

  app.use(express.json());

  app.use('/health', healthRoutes);

  if (bookingService) {
    app.use('/api/v1/bookings', createBookingRoutes(bookingService));
  }

  app.use((error, req, res, next) => {
    const status = [400, 404].includes(error.status)
      ? error.status
      : 500;

    if (status === 500) {
      console.error(error);
    }

    res.status(status).json({
      error: status === 500
        ? 'Internal server error'
        : error.message
    });
  });

  return app;
}

export function createProductionApp() {
  const pool = createPool();
  const repository = createBookingRepository(pool);
  const service = createBookingService(repository);

  return createApp({ bookingService: service });
}

export default createApp();

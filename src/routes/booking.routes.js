
import { Router } from 'express';

export function createBookingRoutes(service) {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const booking = await service.create(req.body);
      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  });


  router.get('/', async (req, res, next) => {
    try {
      const bookings = await service.findAll();
      res.status(200).json(bookings);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const booking = await service.findById(req.params.id);
      res.status(200).json(booking);
    } catch (error) {
      next(error);
    }
  });


  return router;
}

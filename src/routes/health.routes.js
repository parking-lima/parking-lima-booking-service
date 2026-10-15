
import { Router } from 'express';

const router = Router();

router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'booking-service'
  });
});

export default router;

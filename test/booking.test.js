
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../src/app.js';
import { createBookingService } from '../src/services/booking.service.js';

async function requestBooking(bookingService, payload) {
  const app = createApp({ bookingService });
  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once('listening', resolve));

    const { port } = server.address();

    return await fetch(`http://127.0.0.1:${port}/api/v1/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve())
    );
  }
}

test('POST /api/v1/bookings returns 201 for valid data', async () => {
  const repository = {
    async create(booking) {
      return {
        id: '1',
        user_id: booking.userId,
        parking_space_id: booking.parkingSpaceId,
        status: 'PENDING'
      };
    }
  };

  const service = createBookingService(repository);

  const response = await requestBooking(service, {
    userId: 1,
    parkingSpaceId: 1,
    startsAt: '2026-10-20T09:00:00Z',
    endsAt: '2026-10-20T11:00:00Z'
  });

  assert.equal(response.status, 201);

  const body = await response.json();

  assert.equal(body.status, 'PENDING');
  assert.equal(body.user_id, 1);
});

test('POST /api/v1/bookings returns 400 for invalid dates', async () => {
  const repository = {
    async create() {
      throw new Error('Repository should not be called');
    }
  };

  const service = createBookingService(repository);

  const response = await requestBooking(service, {
    userId: 1,
    parkingSpaceId: 1,
    startsAt: '2026-10-20T11:00:00Z',
    endsAt: '2026-10-20T09:00:00Z'
  });

  assert.equal(response.status, 400);
});


test('GET /api/v1/bookings returns 200', async () => {
  const app = createApp({
    bookingService: {
      async findAll() {
        return [
          { id: '1', status: 'PENDING' }
        ];
      }
    }
  });

  const server = app.listen(0);

  try {
    await new Promise(resolve =>
      server.once('listening', resolve)
    );

    const { port } = server.address();

    const response = await fetch(
      `http://127.0.0.1:${port}/api/v1/bookings`
    );

    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.length, 1);
    assert.equal(body[0].status, 'PENDING');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('GET /api/v1/bookings/:id returns 200', async () => {
  const app = createApp({
    bookingService: {
      async findById(id) {
        return { id, status: 'PENDING' };
      }
    }
  });

  const server = app.listen(0);

  try {
    await new Promise(resolve =>
      server.once('listening', resolve)
    );

    const { port } = server.address();

    const response = await fetch(
      `http://127.0.0.1:${port}/api/v1/bookings/1`
    );

    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.id, '1');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('GET /api/v1/bookings/:id returns 404', async () => {
  const repository = {
    async findById() {
      return null;
    }
  };

  const service = createBookingService(repository);
  const app = createApp({ bookingService: service });

  const server = app.listen(0);

  try {
    await new Promise(resolve =>
      server.once('listening', resolve)
    );

    const { port } = server.address();

    const response = await fetch(
      `http://127.0.0.1:${port}/api/v1/bookings/99999`
    );

    assert.equal(response.status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('GET /api/v1/bookings/:id returns 400 for invalid ID', async () => {
  const repository = {
    async findById() {
      throw new Error('Repository should not be called');
    }
  };

  const service = createBookingService(repository);
  const app = createApp({ bookingService: service });

  const server = app.listen(0);

  try {
    await new Promise(resolve =>
      server.once('listening', resolve)
    );

    const { port } = server.address();

    const response = await fetch(
      `http://127.0.0.1:${port}/api/v1/bookings/abc`
    );

    assert.equal(response.status, 400);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});


test('POST /api/v1/bookings returns 409 for overlapping bookings', async () => {
  const repository = {
    async create() {
      const error = new Error('Exclusion constraint violated');
      error.code = '23P01';
      error.constraint = 'bookings_no_overlap';
      throw error;
    }
  };

  const service = createBookingService(repository);

  const response = await requestBooking(service, {
    userId: 1,
    parkingSpaceId: 1,
    startsAt: '2026-10-20T10:00:00Z',
    endsAt: '2026-10-20T12:00:00Z'
  });

  assert.equal(response.status, 409);

  const body = await response.json();
  assert.match(
    JSON.stringify(body),
    /already booked/i
  );
});

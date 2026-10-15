
import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

test('GET /health/live returns HTTP 200', async () => {
  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once('listening', resolve));

    const address = server.address();
    const response = await fetch(
      `http://127.0.0.1:${address.port}/health/live`
    );

    assert.equal(response.status, 200);

    const body = await response.json();

    assert.deepEqual(body, {
      status: 'UP',
      service: 'booking-service'
    });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

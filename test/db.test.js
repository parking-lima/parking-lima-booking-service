
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../src/db/pool.js';

test('createPool requires DATABASE_URL', () => {
  assert.throws(
    () => createPool(''),
    /DATABASE_URL is required/
  );
});

test('createPool creates a PostgreSQL pool', async () => {
  const pool = createPool(
    'postgresql://test:test@localhost:5433/booking_db'
  );

  try {
    assert.equal(pool.options.max, 10);
    assert.equal(pool.options.connectionTimeoutMillis, 5000);
  } finally {
    await pool.end();
  }
});

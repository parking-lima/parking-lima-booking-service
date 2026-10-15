
export function createBookingRepository(pool) {
  return {
    async create(booking) {
      const result = await pool.query(
        `INSERT INTO bookings
          (user_id, parking_space_id, starts_at, ends_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          booking.userId,
          booking.parkingSpaceId,
          booking.startsAt,
          booking.endsAt
        ]
      );

      return result.rows[0];
    },

    async findAll() {
      const result = await pool.query(
        `SELECT *
     FROM bookings
     ORDER BY created_at DESC, id DESC`
      );

      return result.rows;
    },

    async findById(id) {
      const result = await pool.query(
        `SELECT *
     FROM bookings
     WHERE id = $1`,
        [id]
      );

      return result.rows[0] ?? null;
    }

  };
}

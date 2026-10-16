
export const up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS btree_gist;
  `);

  pgm.sql(`
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_no_overlap
    EXCLUDE USING gist (
      parking_space_id WITH =,
      tstzrange(starts_at, ends_at, '[)') WITH &&
    )
    WHERE (status IN ('PENDING', 'CONFIRMED'));
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE bookings
    DROP CONSTRAINT IF EXISTS bookings_no_overlap;
  `);
};

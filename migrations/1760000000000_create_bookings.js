
export const up = (pgm) => {
  pgm.createTable('bookings', {
    id: {
      type: 'bigserial',
      primaryKey: true
    },
    user_id: {
      type: 'bigint',
      notNull: true
    },
    parking_space_id: {
      type: 'bigint',
      notNull: true
    },
    starts_at: {
      type: 'timestamptz',
      notNull: true
    },
    ends_at: {
      type: 'timestamptz',
      notNull: true
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'PENDING'
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  });

  pgm.addConstraint('bookings', 'bookings_valid_time', {
    check: 'ends_at > starts_at'
  });

  pgm.addConstraint('bookings', 'bookings_valid_status', {
    check: "status IN ('PENDING', 'CONFIRMED', 'CANCELLED')"
  });
};

export const down = (pgm) => {
  pgm.dropTable('bookings');
};

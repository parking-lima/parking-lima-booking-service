
export function createBookingService(repository) {
  return {
    async create(data) {
      const { userId, parkingSpaceId, startsAt, endsAt } = data ?? {};

      const validId = (id) =>
        Number.isSafeInteger(id) && id > 0;

      const start = Date.parse(startsAt);
      const end = Date.parse(endsAt);

      if (
        !validId(userId) ||
        !validId(parkingSpaceId) ||
        typeof startsAt !== 'string' ||
        typeof endsAt !== 'string' ||
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        end <= start
      ) {
        const error = new Error('Invalid booking data');
        error.status = 400;
        throw error;
      }

      return repository.create({
        userId,
        parkingSpaceId,
        startsAt,
        endsAt
      });
    },

    async findAll() {
      return repository.findAll();
    },

    async findById(id) {
      if (!/^[1-9]\d*$/.test(id) ||
        !Number.isSafeInteger(Number(id))) {
        const error = new Error('Invalid booking ID');
        error.status = 400;
        throw error;
      }

      const booking = await repository.findById(id);

      if (!booking) {
        const error = new Error('Booking not found');
        error.status = 404;
        throw error;
      }

      return booking;
    }

  };
}

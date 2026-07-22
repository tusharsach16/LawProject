import * as redisClient from '../../utils/redisClient';
import {
  getSlotCacheKey,
  getLockKey,
  getLawyerAppointmentsCacheKey,
  getUserAppointmentsCacheKey,
  getPendingAppointmentsCacheKey,
  getLawyerStatsCacheKey,
  acquireBookingLock,
  releaseBookingLock,
  getCachedSlots,
  cacheSlots,
  clearSlotCache,
  getCachedLawyerAppointments,
  cacheLawyerAppointments,
  clearLawyerAppointmentCache,
  getCachedUserAppointments,
  cacheUserAppointments,
  clearUserAppointmentCache,
  getCachedLawyerStats,
  cacheLawyerStats,
  clearLawyerStatsCache,
  invalidateAppointmentCaches
} from '../../utils/AppointmentCache';

jest.mock('../../utils/redisClient');

describe('AppointmentCache Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cache Key Builders', () => {
    test('should construct correct Redis cache keys', () => {
      expect(getSlotCacheKey('lawyer1', '2026-07-22')).toBe('slots:lawyer1:2026-07-22');
      expect(getLockKey('lawyer1', 1700000000000)).toBe('lock:lawyer1:1700000000000');
      expect(getLawyerAppointmentsCacheKey('lawyer1', 'scheduled')).toBe('appointments:lawyer:lawyer1:scheduled');
      expect(getLawyerAppointmentsCacheKey('lawyer1')).toBe('appointments:lawyer:lawyer1:all');
      expect(getUserAppointmentsCacheKey('user1', 'completed')).toBe('appointments:user:user1:completed');
      expect(getUserAppointmentsCacheKey('user1')).toBe('appointments:user:user1:all');
      expect(getPendingAppointmentsCacheKey('user1')).toBe('appointments:pending:user1');
      expect(getLawyerStatsCacheKey('lawyer1')).toBe('stats:lawyer:lawyer1');
    });
  });

  describe('Distributed Locking', () => {
    test('acquireBookingLock should return true when Redis is disabled', async () => {
      (redisClient.isRedisAvailable as jest.Mock).mockReturnValue(false);

      const acquired = await acquireBookingLock('lawyer1', new Date());
      expect(acquired).toBe(true);
      expect(redisClient.redisSet).not.toHaveBeenCalled();
    });

    test('acquireBookingLock should return true when lock acquired successfully', async () => {
      (redisClient.isRedisAvailable as jest.Mock).mockReturnValue(true);
      (redisClient.redisSet as jest.Mock).mockResolvedValue(true);

      const date = new Date('2026-07-22T10:00:00Z');
      const acquired = await acquireBookingLock('lawyer1', date, 10);

      expect(acquired).toBe(true);
      expect(redisClient.redisSet).toHaveBeenCalledWith(
        getLockKey('lawyer1', date.getTime()),
        expect.any(String),
        10
      );
    });

    test('releaseBookingLock should call redisDel when Redis is available', async () => {
      (redisClient.isRedisAvailable as jest.Mock).mockReturnValue(true);
      (redisClient.redisDel as jest.Mock).mockResolvedValue(1);

      const date = new Date('2026-07-22T10:00:00Z');
      await releaseBookingLock('lawyer1', date);

      expect(redisClient.redisDel).toHaveBeenCalledWith(getLockKey('lawyer1', date.getTime()));
    });
  });

  describe('Slots Caching', () => {
    test('getCachedSlots should return parsed data on HIT', async () => {
      (redisClient.isRedisAvailable as jest.Mock).mockReturnValue(true);
      const mockSlots = [{ time: '10:00', available: true }];
      (redisClient.redisGet as jest.Mock).mockResolvedValue(JSON.stringify(mockSlots));

      const result = await getCachedSlots('lawyer1', '2026-07-22');
      expect(result).toEqual(mockSlots);
      expect(redisClient.redisGet).toHaveBeenCalledWith('slots:lawyer1:2026-07-22');
    });

    test('getCachedSlots should return null on MISS or Redis unavailable', async () => {
      (redisClient.isRedisAvailable as jest.Mock).mockReturnValue(true);
      (redisClient.redisGet as jest.Mock).mockResolvedValue(null);

      const result = await getCachedSlots('lawyer1', '2026-07-22');
      expect(result).toBeNull();
    });

    test('cacheSlots should set JSON serialized string in Redis', async () => {
      (redisClient.isRedisAvailable as jest.Mock).mockReturnValue(true);
      const mockSlots = [{ time: '10:00' }];

      await cacheSlots('lawyer1', '2026-07-22', mockSlots, 300);

      expect(redisClient.redisSet).toHaveBeenCalledWith(
        'slots:lawyer1:2026-07-22',
        JSON.stringify(mockSlots),
        300
      );
    });

    test('clearSlotCache should delete slot key from Redis', async () => {
      (redisClient.isRedisAvailable as jest.Mock).mockReturnValue(true);

      await clearSlotCache('lawyer1', '2026-07-22');

      expect(redisClient.redisDel).toHaveBeenCalledWith('slots:lawyer1:2026-07-22');
    });
  });

  describe('Appointments & Stats Caching', () => {
    test('getCachedLawyerAppointments and cacheLawyerAppointments flow', async () => {
      (redisClient.isRedisAvailable as jest.Mock).mockReturnValue(true);
      const appts = [{ id: 'app1' }];

      await cacheLawyerAppointments('lawyer1', appts, 'scheduled', 60);
      expect(redisClient.redisSet).toHaveBeenCalledWith(
        'appointments:lawyer:lawyer1:scheduled',
        JSON.stringify(appts),
        60
      );

      (redisClient.redisGet as jest.Mock).mockResolvedValue(JSON.stringify(appts));
      const res = await getCachedLawyerAppointments('lawyer1', 'scheduled');
      expect(res).toEqual(appts);
    });

    test('clearLawyerAppointmentCache should clear all status variants', async () => {
      (redisClient.isRedisAvailable as jest.Mock).mockReturnValue(true);

      await clearLawyerAppointmentCache('lawyer1');

      expect(redisClient.redisDel).toHaveBeenCalledWith('appointments:lawyer:lawyer1:all');
      expect(redisClient.redisDel).toHaveBeenCalledWith('appointments:lawyer:lawyer1:scheduled');
      expect(redisClient.redisDel).toHaveBeenCalledWith('appointments:lawyer:lawyer1:completed');
      expect(redisClient.redisDel).toHaveBeenCalledWith('appointments:lawyer:lawyer1:cancelled');
    });

    test('invalidateAppointmentCaches should invalidate user, lawyer, slots, and stats caches', async () => {
      (redisClient.isRedisAvailable as jest.Mock).mockReturnValue(true);

      const apptDate = new Date('2026-07-22T00:00:00Z');
      await invalidateAppointmentCaches('user1', 'lawyer1', apptDate);

      expect(redisClient.redisDel).toHaveBeenCalledWith('slots:lawyer1:2026-07-22');
      expect(redisClient.redisDel).toHaveBeenCalledWith('stats:lawyer:lawyer1');
    });
  });
});

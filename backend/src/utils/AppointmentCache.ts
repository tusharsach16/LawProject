import { redisGet, redisSet, redisDel, redisExpire, isRedisAvailable } from './redisClient';

// CACHE KEYS
export const getSlotCacheKey = (lawyerId: string, date: string) =>
    `slots:${lawyerId}:${date}`;

export const getLockKey = (lawyerId: string, appointmentTime: number) =>
    `lock:${lawyerId}:${appointmentTime}`;

export const getLawyerAppointmentsCacheKey = (lawyerId: string, status?: string) =>
    `appointments:lawyer:${lawyerId}:${status || 'all'}`;

export const getUserAppointmentsCacheKey = (userId: string, status?: string) =>
    `appointments:user:${userId}:${status || 'all'}`;

export const getPendingAppointmentsCacheKey = (userId: string) =>
    `appointments:pending:${userId}`;

export const getLawyerStatsCacheKey = (lawyerId: string) =>
    `stats:lawyer:${lawyerId}`;


// DISTRIBUTED LOCK
export const acquireBookingLock = async (
    lawyerId: string,
    appointmentTime: Date,
    ttlSeconds: number = 10
): Promise<boolean> => {
    if (!isRedisAvailable()) return true;

    const lockKey = getLockKey(lawyerId, appointmentTime.getTime());
    const lockValue = `${Date.now()}-${Math.random()}`;

    try {
        const acquired = await redisSet(lockKey, lockValue, ttlSeconds);

        if (acquired) {
            console.log(`[Redis Lock] ✓ Acquired: ${lockKey}`);
        } else {
            console.log(`[Redis Lock] ✗ Already locked: ${lockKey}`);
        }

        return acquired;
    } catch (error) {
        console.error('[Redis Lock] Error:', error);
        return true;
    }
};

export const releaseBookingLock = async (
    lawyerId: string,
    appointmentTime: Date
): Promise<void> => {
    if (!isRedisAvailable()) return;

    const lockKey = getLockKey(lawyerId, appointmentTime.getTime());

    try {
        await redisDel(lockKey);
        console.log(`[Redis Lock] Released: ${lockKey}`);
    } catch (error) {
        console.error('[Redis Lock] Error releasing:', error);
    }
};

// SLOTS CACHE
export const getCachedSlots = async (
    lawyerId: string,
    date: string
): Promise<any | null> => {
    if (!isRedisAvailable()) return null;

    try {
        const cacheKey = getSlotCacheKey(lawyerId, date);
        const cached = await redisGet(cacheKey);

        if (cached) {
            console.log(`[Redis Cache] ✓ HIT: slots for ${lawyerId} on ${date}`);
            return JSON.parse(cached);
        }

        console.log(`[Redis Cache] ✗ MISS: slots for ${lawyerId} on ${date}`);
        return null;
    } catch (error) {
        console.error('[Redis Cache] Error getting slots:', error);
        return null;
    }
};

export const cacheSlots = async (
    lawyerId: string,
    date: string,
    data: any,
    ttlSeconds: number = 300
): Promise<void> => {
    if (!isRedisAvailable()) return;

    try {
        const cacheKey = getSlotCacheKey(lawyerId, date);
        await redisSet(cacheKey, JSON.stringify(data), ttlSeconds);
        console.log(`[Redis Cache] SET: slots for ${lawyerId} on ${date} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
        console.error('[Redis Cache] Error caching slots:', error);
    }
};

export const clearSlotCache = async (
    lawyerId: string,
    date: string
): Promise<void> => {
    if (!isRedisAvailable()) return;

    try {
        const cacheKey = getSlotCacheKey(lawyerId, date);
        await redisDel(cacheKey);
        console.log(`[Redis Cache] CLEARED: slots for ${lawyerId} on ${date}`);
    } catch (error) {
        console.error('[Redis Cache] Error clearing slots:', error);
    }
};

// APPOINTMENTS CACHE
export const getCachedLawyerAppointments = async (
    lawyerId: string,
    status?: string
): Promise<any | null> => {
    if (!isRedisAvailable()) return null;

    try {
        const cacheKey = getLawyerAppointmentsCacheKey(lawyerId, status);
        const cached = await redisGet(cacheKey);

        if (cached) {
            console.log(`[Redis Cache] ✓ HIT: lawyer appointments ${cacheKey}`);
            return JSON.parse(cached);
        }

        console.log(`[Redis Cache] ✗ MISS: lawyer appointments ${cacheKey}`);
        return null;
    } catch (error) {
        console.error('[Redis Cache] Error getting lawyer appointments:', error);
        return null;
    }
};

export const cacheLawyerAppointments = async (
    lawyerId: string,
    data: any,
    status?: string,
    ttlSeconds: number = 60
): Promise<void> => {
    if (!isRedisAvailable()) return;

    try {
        const cacheKey = getLawyerAppointmentsCacheKey(lawyerId, status);
        await redisSet(cacheKey, JSON.stringify(data), ttlSeconds);
        console.log(`[Redis Cache] SET: lawyer appointments ${cacheKey} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
        console.error('[Redis Cache] Error caching lawyer appointments:', error);
    }
};

export const clearLawyerAppointmentCache = async (lawyerId: string): Promise<void> => {
    if (!isRedisAvailable()) return;

    try {
        const statuses = ['all', 'scheduled', 'completed', 'cancelled'];
        const promises = statuses.map(status =>
            redisDel(getLawyerAppointmentsCacheKey(lawyerId, status))
        );

        await Promise.all(promises);
        console.log(`[Redis Cache] CLEARED: all lawyer appointments for ${lawyerId}`);
    } catch (error) {
        console.error('[Redis Cache] Error clearing lawyer appointments:', error);
    }
};

export const getCachedUserAppointments = async (
    userId: string,
    status?: string
): Promise<any | null> => {
    if (!isRedisAvailable()) return null;

    try {
        const cacheKey = getUserAppointmentsCacheKey(userId, status);
        const cached = await redisGet(cacheKey);

        if (cached) {
            console.log(`[Redis Cache] ✓ HIT: user appointments ${cacheKey}`);
            return JSON.parse(cached);
        }

        console.log(`[Redis Cache] ✗ MISS: user appointments ${cacheKey}`);
        return null;
    } catch (error) {
        console.error('[Redis Cache] Error getting user appointments:', error);
        return null;
    }
};

export const cacheUserAppointments = async (
    userId: string,
    data: any,
    status?: string,
    ttlSeconds: number = 60
): Promise<void> => {
    if (!isRedisAvailable()) return;

    try {
        const cacheKey = getUserAppointmentsCacheKey(userId, status);
        await redisSet(cacheKey, JSON.stringify(data), ttlSeconds);
        console.log(`[Redis Cache] SET: user appointments ${cacheKey} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
        console.error('[Redis Cache] Error caching user appointments:', error);
    }
};

export const clearUserAppointmentCache = async (userId: string): Promise<void> => {
    if (!isRedisAvailable()) return;

    try {
        const statuses = ['all', 'scheduled', 'completed', 'cancelled'];
        const promises = statuses.map(status =>
            redisDel(getUserAppointmentsCacheKey(userId, status))
        );

        promises.push(redisDel(getPendingAppointmentsCacheKey(userId)));

        await Promise.all(promises);
        console.log(`[Redis Cache] CLEARED: all user appointments for ${userId}`);
    } catch (error) {
        console.error('[Redis Cache] Error clearing user appointments:', error);
    }
};

// STATS CACHE
export const getCachedLawyerStats = async (lawyerId: string): Promise<any | null> => {
    if (!isRedisAvailable()) return null;

    try {
        const cacheKey = getLawyerStatsCacheKey(lawyerId);
        const cached = await redisGet(cacheKey);

        if (cached) {
            console.log(`[Redis Cache] ✓ HIT: lawyer stats ${lawyerId}`);
            return JSON.parse(cached);
        }

        console.log(`[Redis Cache] ✗ MISS: lawyer stats ${lawyerId}`);
        return null;
    } catch (error) {
        console.error('[Redis Cache] Error getting lawyer stats:', error);
        return null;
    }
};

export const cacheLawyerStats = async (
    lawyerId: string,
    data: any,
    ttlSeconds: number = 300
): Promise<void> => {
    if (!isRedisAvailable()) return;

    try {
        const cacheKey = getLawyerStatsCacheKey(lawyerId);
        await redisSet(cacheKey, JSON.stringify(data), ttlSeconds);
        console.log(`[Redis Cache] SET: lawyer stats ${lawyerId} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
        console.error('[Redis Cache] Error caching lawyer stats:', error);
    }
};

export const clearLawyerStatsCache = async (lawyerId: string): Promise<void> => {
    if (!isRedisAvailable()) return;

    try {
        const cacheKey = getLawyerStatsCacheKey(lawyerId);
        await redisDel(cacheKey);
        console.log(`[Redis Cache] CLEARED: lawyer stats ${lawyerId}`);
    } catch (error) {
        console.error('[Redis Cache] Error clearing lawyer stats:', error);
    }
};

// BATCH INVALIDATION
export const invalidateAppointmentCaches = async (
    userId: string,
    lawyerId: string,
    appointmentDate: Date
): Promise<void> => {
    if (!isRedisAvailable()) return;

    try {
        const dateString = appointmentDate.toISOString().split('T')[0];

        await Promise.all([
            clearSlotCache(lawyerId, dateString),
            clearUserAppointmentCache(userId),
            clearLawyerAppointmentCache(lawyerId),
            clearLawyerStatsCache(lawyerId)
        ]);

        console.log(`[Redis Cache] INVALIDATED: all caches for appointment (user: ${userId}, lawyer: ${lawyerId})`);
    } catch (error) {
        console.error('[Redis Cache] Error invalidating appointment caches:', error);
    }
};
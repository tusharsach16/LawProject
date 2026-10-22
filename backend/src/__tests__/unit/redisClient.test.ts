import { sanitizeRedisUrl } from '../../utils/redisClient';

describe('redisClient Unit Tests', () => {
  describe('sanitizeRedisUrl', () => {
    test('masks passwords in standard redis URLs', () => {
      const sanitized = sanitizeRedisUrl('redis://default:mySecretPassword123@localhost:6379');
      expect(sanitized).toBe('redis://default:***@localhost:6379');
      expect(sanitized).not.toContain('mySecretPassword123');
    });

    test('masks passwords in rediss TLS URLs', () => {
      const sanitized = sanitizeRedisUrl('rediss://default:upstash_token_xyz@sensible-fox-12345.upstash.io:6379');
      expect(sanitized).toBe('rediss://default:***@sensible-fox-12345.upstash.io:6379');
      expect(sanitized).not.toContain('upstash_token_xyz');
    });

    test('handles URLs without password', () => {
      const sanitized = sanitizeRedisUrl('redis://localhost:6379');
      expect(sanitized).toBe('redis://localhost:6379');
    });

    test('masks password when username is empty', () => {
      const sanitized = sanitizeRedisUrl('redis://:onlyPassword@127.0.0.1:6379');
      expect(sanitized).toBe('redis://:***@127.0.0.1:6379');
      expect(sanitized).not.toContain('onlyPassword');
    });
  });
});

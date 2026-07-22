import { getIceServers } from '../../turn';

describe('TURN Service Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should return default free STUN servers when Twilio credentials are missing', async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;

    const servers = await getIceServers();
    expect(servers).toBeDefined();
    expect(servers.length).toBeGreaterThan(0);
    expect(servers[0].urls).toContain('stun:stun.l.google.com:19302');
  });
});

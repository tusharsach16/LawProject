import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import chatbotRoutes from '../../routes/chatbotRoutes';
import { ChatHistory } from '../../models/ChatHistory';
import { encryptMessage } from '../../utils/cryptoUtils';

jest.mock('../../models/ChatHistory');
jest.mock('../../utils/redisClient', () => ({
  isRedisAvailable: jest.fn().mockReturnValue(false),
  redisGet: jest.fn().mockResolvedValue(null),
  redisSet: jest.fn().mockResolvedValue(true),
  redisDel: jest.fn().mockResolvedValue(true)
}));

const app = express();
app.use(express.json());
app.use('/api', chatbotRoutes);

describe('Chatbot Routes Integration Tests', () => {
  const secret = 'test-secret-key';
  const encryptionKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  let token: string;
  const mockUserId = '507f1f77bcf86cd799439011';

  beforeAll(() => {
    process.env.CHAT_ENCRYPTION_KEY = encryptionKey;
    process.env.JWT_SECRET = secret;
    process.env.GOOGLE_GEMINI_API_KEY = 'test-gemini-key';
  });

  beforeEach(() => {
    token = jwt.sign(
      { _id: mockUserId, id: mockUserId, role: 'general' },
      secret
    );
    jest.clearAllMocks();
  });

  describe('Authentication Enforcement', () => {
    test('POST /api/chat returns 401 without authorization header', async () => {
      const res = await request(app).post('/api/chat').send({ message: 'Hello' });
      expect(res.status).toBe(401);
    });

    test('GET /api/chat returns 401 without authorization header', async () => {
      const res = await request(app).get('/api/chat');
      expect(res.status).toBe(401);
    });

    test('DELETE /api/chat returns 401 without authorization header', async () => {
      const res = await request(app).delete('/api/chat');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/chat', () => {
    test('returns empty array when user has no conversation history', async () => {
      (ChatHistory.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/chat')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns decrypted messages without exposing encryptionVersion', async () => {
      const encryptedMsg = encryptMessage('What is Section 302?');
      (ChatHistory.findOne as jest.Mock).mockImplementation((_query, projection) => {
        if (projection?.historyVersion) {
          return Promise.resolve({ userId: mockUserId, historyVersion: 1 });
        }
        return Promise.resolve({
          userId: mockUserId,
          historyVersion: 1,
          messages: [
            {
              sender: 'user',
              content: encryptedMsg,
              encryptionVersion: 'v1',
              createdAt: '2026-06-01T10:00:00.000Z',
              updatedAt: '2026-06-01T10:00:00.000Z'
            }
          ]
        });
      });

      const res = await request(app)
        .get('/api/chat')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].content).toBe('What is Section 302?');
      expect(res.body[0].sender).toBe('user');
      expect(res.body[0].encryptionVersion).toBeUndefined();
    });
  });

  describe('DELETE /api/chat', () => {
    test('clears conversation history and atomically increments version', async () => {
      (ChatHistory.findOneAndUpdate as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        historyVersion: 2,
        messages: []
      });

      const res = await request(app)
        .delete('/api/chat')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Chat history cleared successfully' });
      expect(ChatHistory.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: mockUserId },
        { $set: { messages: [] }, $inc: { historyVersion: 1 } },
        { new: true }
      );
    });
  });

  describe('POST /api/chat validation', () => {
    test('returns 400 when message is missing', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Message is required' });
    });
  });
});

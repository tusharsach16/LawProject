import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import quizRoutes from '../../routes/QuizRoutes';
import { Category } from '../../models/quiz/Category';
import { Questions } from '../../models/quiz/Question';
import { Attempts } from '../../models/quiz/userQuizAttempt';

jest.mock('../../models/quiz/Category');
jest.mock('../../models/quiz/Question');
jest.mock('../../models/quiz/userQuizAttempt');
jest.mock('../../models/Mocktrial/Mock');
jest.mock('../../models/ChatHistory');
jest.mock('../../utils/redisClient', () => ({
  redisGet: jest.fn().mockResolvedValue(null),
  redisSet: jest.fn().mockResolvedValue(true)
}));

const app = express();
app.use(express.json());
app.use('/api', quizRoutes);

describe('Quiz Controller Integration Tests', () => {
  const secret = 'test-secret-key';
  let token: string;

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    token = jwt.sign(
      { _id: '507f1f77bcf86cd799439011', id: '507f1f77bcf86cd799439011', role: 'general' },
      secret
    );
    jest.clearAllMocks();
  });

  describe('GET /api/quiz/getQuiz', () => {
    test('should return 401 when request is unauthorized', async () => {
      const response = await request(app).get('/api/quiz/getQuiz');
      expect(response.status).toBe(401);
    });

    test('should return 404 if category slug is invalid', async () => {
      (Category.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/quiz/getQuiz?category=nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Category not found');
    });

    test('should return questions list for valid request', async () => {
      const mockQuestions = [
        { _id: 'q1', questionText: 'What is IPC 302?', options: ['Murder', 'Theft', 'Assault'], correctIndex: 0 }
      ];

      (Questions.aggregate as jest.Mock).mockResolvedValue(mockQuestions);

      const response = await request(app)
        .get('/api/quiz/getQuiz')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.quiz).toBeDefined();
      expect(response.body.quiz).toHaveLength(1);
    });
  });

  describe('POST /api/quiz/submit', () => {
    test('should return 400 if answers array is missing or empty', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({ category: 'constitutional-law', answers: [] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('answers array required');
    });
  });

  describe('GET /api/quiz/count', () => {
    test('should return quiz attempt count for authenticated user', async () => {
      (Attempts.countDocuments as jest.Mock).mockResolvedValue(5);

      const response = await request(app)
        .get('/api/quiz/count')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.quizCount).toBe(5);
    });
  });
});

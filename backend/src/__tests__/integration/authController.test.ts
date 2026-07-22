import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRoutes from '../../routes/authRoutes';
import { User } from '../../models/User';
import { GeneralUser } from '../../models/GeneralUser';
import { Lawyer } from '../../models/Lawyer';
import { LawStudent } from '../../models/LawStudent';

jest.mock('../../models/User');
jest.mock('../../models/GeneralUser');
jest.mock('../../models/Lawyer');
jest.mock('../../models/LawStudent');
jest.mock('../../utils/redisClient', () => ({
  isRedisAvailable: jest.fn().mockReturnValue(false),
  redisGet: jest.fn(),
  redisSet: jest.fn(),
  redisDel: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/api', authRoutes);

describe('Auth Controller Integration Tests', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
    jest.clearAllMocks();
  });

  describe('POST /api/signup', () => {
    test('should register a new user successfully and return 201 with JWT token', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        role: 'general',
        phoneNumber: '1234567890'
      });
      (GeneralUser.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/api/signup')
        .send({
          name: 'John',
          lastname: 'Doe',
          username: 'johndoe',
          email: 'john@example.com',
          password: 'Password123!',
          phoneNumber: '1234567890',
          role: 'general'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.message).toBe('Signup successful');
      expect(response.body.user.username).toBe('johndoe');
    });

    test('should return 400 if user with email/username already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: 'john@example.com' });

      const response = await request(app)
        .post('/api/signup')
        .send({
          name: 'John',
          username: 'johndoe',
          email: 'john@example.com',
          password: 'Password123!',
          role: 'general'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email or Username already in use');
    });
  });

  describe('POST /api/login', () => {
    test('should authenticate user and return token on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'general'
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'john@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body).toHaveProperty('token');
    });

    test('should return 400 when invalid password is provided', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            _id: '507f1f77bcf86cd799439011',
            email: 'john@example.com',
            password: hashedPassword
          })
        })
      });

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should return 400 when email is not found', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null)
        })
      });

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/get', () => {
    test('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/get');
      expect(response.status).toBe(401);
    });

    test('should return 200 with profile when valid token provided', async () => {
      const token = jwt.sign(
        { _id: '507f1f77bcf86cd799439011', id: '507f1f77bcf86cd799439011', role: 'general' },
        process.env.JWT_SECRET!
      );

      const mockUserProfile = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John',
        email: 'john@example.com',
        role: 'general'
      };

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockUserProfile)
        })
      });
      (Lawyer.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });
      (LawStudent.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });
      (GeneralUser.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue({ bio: 'General User' })
      });

      const response = await request(app)
        .get('/api/get')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('john@example.com');
    });
  });
});

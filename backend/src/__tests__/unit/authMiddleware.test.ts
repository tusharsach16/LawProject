import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware from '../../middleware/authMiddleware';

describe('Auth Middleware Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  const secret = 'test-jwt-secret';

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 401 UNAUTHORIZED if authorization header is missing', async () => {
    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: 'Access denied. No token provided.',
      error: 'UNAUTHORIZED'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 401 UNAUTHORIZED if authorization header does not start with Bearer', async () => {
    mockRequest.headers = { authorization: 'Basic token123' };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: 'Access denied. No token provided.',
      error: 'UNAUTHORIZED'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 500 if JWT_SECRET is not configured', async () => {
    delete process.env.JWT_SECRET;
    mockRequest.headers = { authorization: 'Bearer some.token.here' };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: 'Server configuration error',
      error: 'JWT_SECRET_MISSING'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should attach user payload to request and call next() on valid token', async () => {
    const payload = {
      _id: 'user123',
      id: 'user123',
      role: 'lawyer',
      email: 'test@example.com'
    };

    const token = jwt.sign(payload, secret);
    mockRequest.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect((mockRequest as any).user).toEqual({
      _id: 'user123',
      id: 'user123',
      role: 'lawyer',
      email: 'test@example.com'
    });
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  test('should return 401 INVALID_TOKEN_PAYLOAD if payload lacks user id', async () => {
    const payload = { role: 'lawyer' }; // missing _id, id, and userId
    const token = jwt.sign(payload, secret);
    mockRequest.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: 'Invalid token - no user ID',
      error: 'INVALID_TOKEN_PAYLOAD'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 401 INVALID_TOKEN if token signature is invalid', async () => {
    const token = jwt.sign({ _id: 'user123' }, 'wrong-secret');
    mockRequest.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: 'Invalid token.',
      error: 'INVALID_TOKEN'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 401 TOKEN_EXPIRED if token has expired', async () => {
    const token = jwt.sign({ _id: 'user123' }, secret, { expiresIn: '-1s' });
    mockRequest.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: 'Token expired. Please log in again.',
      error: 'TOKEN_EXPIRED'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});

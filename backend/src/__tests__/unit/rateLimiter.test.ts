import {
  loginLimiter,
  signupLimiter,
  forgotPasswordLimiter,
  otpVerifyLimiter,
  resetPasswordLimiter,
  userLimiter
} from '../../middleware/rateLimiter';

describe('Rate Limiter Middleware Unit Tests', () => {
  test('loginLimiter should be defined as a function middleware', () => {
    expect(typeof loginLimiter).toBe('function');
  });

  test('signupLimiter should be defined as a function middleware', () => {
    expect(typeof signupLimiter).toBe('function');
  });

  test('forgotPasswordLimiter should be defined as a function middleware', () => {
    expect(typeof forgotPasswordLimiter).toBe('function');
  });

  test('otpVerifyLimiter should be defined as a function middleware', () => {
    expect(typeof otpVerifyLimiter).toBe('function');
  });

  test('resetPasswordLimiter should be defined as a function middleware', () => {
    expect(typeof resetPasswordLimiter).toBe('function');
  });

  test('userLimiter should be defined as a function middleware', () => {
    expect(typeof userLimiter).toBe('function');
  });
});

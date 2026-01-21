import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { User } from '../models/User';

const otpStore = new Map<string, { hashedOtp: string; expiresAt: number }>();
const emailRequestCounters = new Map<string, { count: number; resetAt: number }>();
const otpAttemptCounters = new Map<string, { attempts: number; blockedUntil?: number }>();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const hashOtp = async (otp: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

const isEmailRateLimited = (email: string) => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const limit = 3;

  const entry = emailRequestCounters.get(email);
  if (!entry || now > entry.resetAt) {
    emailRequestCounters.set(email, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) return true;

  entry.count += 1;
  emailRequestCounters.set(email, entry);
  return false;
};

const isOtpAttemptsBlocked = (email: string) => {
  const now = Date.now();
  const entry = otpAttemptCounters.get(email);
  if (!entry) return false;
  if (entry.blockedUntil && now < entry.blockedUntil) return true;
  return false;
};

const registerOtpAttempt = (email: string) => {
  const limit = 5;
  const blockMs = 15 * 60 * 1000;
  const now = Date.now();

  const entry = otpAttemptCounters.get(email);
  if (!entry) {
    otpAttemptCounters.set(email, { attempts: 1 });
    return { blocked: false, attemptsLeft: limit - 1 };
  }

  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { blocked: true, attemptsLeft: 0 };
  }

  entry.attempts += 1;

  if (entry.attempts > limit) {
    entry.blockedUntil = now + blockMs;
    otpAttemptCounters.set(email, entry);
    return { blocked: true, attemptsLeft: 0 };
  }

  otpAttemptCounters.set(email, entry);
  return { blocked: false, attemptsLeft: limit - entry.attempts };
};

const clearOtpAttemptCounter = (email: string) => {
  otpAttemptCounters.delete(email);
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    if (isEmailRateLimited(email)) {
      res.status(200).json({ message: 'If an account exists with this email, an OTP has been sent.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({ message: 'If an account exists with this email, an OTP has been sent.' });
      return;
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    otpStore.set(email, { hashedOtp, expiresAt: Date.now() + 5 * 60 * 1000 });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      html: `<h2>Your OTP is ${otp}</h2><p>Valid for 5 minutes</p>`
    });

    res.status(200).json({ message: 'If an account exists with this email, an OTP has been sent.' });
  } catch {
    res.status(500).json({ message: 'Failed to process request' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP are required' });
      return;
    }

    if (isOtpAttemptsBlocked(email)) {
      res.status(429).json({ message: 'Too many invalid attempts. Try again later.' });
      return;
    }

    const record = otpStore.get(email);
    if (!record || Date.now() > record.expiresAt) {
      registerOtpAttempt(email);
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    const match = await bcrypt.compare(otp, record.hashedOtp);
    if (!match) {
      const { blocked, attemptsLeft } = registerOtpAttempt(email);
      if (blocked) {
        res.status(429).json({ message: 'Too many invalid attempts. Try again later.' });
        return;
      }
      res.status(400).json({ message: `Invalid OTP. ${attemptsLeft} attempts left.` });
      return;
    }

    clearOtpAttemptCounter(email);
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch {
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: 'Email, OTP, and new password are required' });
      return;
    }

    const record = otpStore.get(email);
    if (!record || Date.now() > record.expiresAt) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    const match = await bcrypt.compare(otp, record.hashedOtp);
    if (!match) {
      const { blocked } = registerOtpAttempt(email);
      if (blocked) {
        res.status(429).json({ message: 'Too many invalid attempts. Try again later.' });
        return;
      }
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid request' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    otpStore.delete(email);
    clearOtpAttemptCounter(email);

    res.status(200).json({ message: 'Password reset successful' });
  } catch {
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) otpStore.delete(email);
  }
  for (const [email, data] of emailRequestCounters.entries()) {
    if (now > data.resetAt) emailRequestCounters.delete(email);
  }
}, 60 * 1000);

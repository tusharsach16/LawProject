import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { User } from '../models/User';

const otpStore = new Map<string, { hashedOtp: string; expiresAt: number }>();
const resetTokenStore = new Map<string, { email: string; expiresAt: number }>();
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
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

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

    // Return 429 so the frontend can show a real error message
    if (isEmailRateLimited(email)) {
      res.status(429).json({ message: 'Too many requests. Please try again in 1 hour.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // 200 for security — don't reveal email existence
      res.status(200).json({ message: 'If an account exists with this email, an OTP has been sent.' });
      return;
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    otpStore.set(email, { hashedOtp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP – Nyay Setu',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#1e293b;margin-bottom:8px;">Password Reset Request</h2>
          <p style="color:#475569;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#f59e0b;text-align:center;padding:24px;background:#fef3c7;border-radius:8px;margin:24px 0;">${otp}</div>
          <p style="color:#64748b;font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'If an account exists with this email, an OTP has been sent.' });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('[forgotPassword]', error.message);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
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
      res.status(429).json({ message: 'Too many invalid attempts. Try again in 15 minutes.' });
      return;
    }

    const record = otpStore.get(email);
    if (!record || Date.now() > record.expiresAt) {
      registerOtpAttempt(email);
      res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
      return;
    }

    const match = await bcrypt.compare(otp, record.hashedOtp);
    if (!match) {
      const { blocked, attemptsLeft } = registerOtpAttempt(email);
      if (blocked) {
        res.status(429).json({ message: 'Too many invalid attempts. Try again in 15 minutes.' });
        return;
      }
      res.status(400).json({ message: `Incorrect OTP. ${attemptsLeft} attempt(s) remaining.` });
      return;
    }

    // OTP verified — issue a short-lived reset token and delete the OTP
    const resetToken = generateResetToken();
    otpStore.delete(email);
    clearOtpAttemptCounter(email);
    resetTokenStore.set(resetToken, { email, expiresAt: Date.now() + 15 * 60 * 1000 });

    res.status(200).json({ message: 'OTP verified successfully', resetToken });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('[verifyOtp]', error.message);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      res.status(400).json({ message: 'Reset token and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    const record = resetTokenStore.get(resetToken);
    if (!record || Date.now() > record.expiresAt) {
      res.status(400).json({ message: 'Reset session expired. Please start over.' });
      return;
    }

    const user = await User.findOne({ email: record.email });
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    resetTokenStore.delete(resetToken);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('[resetPassword]', error.message);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) otpStore.delete(email);
  }
  for (const [token, data] of resetTokenStore.entries()) {
    if (now > data.expiresAt) resetTokenStore.delete(token);
  }
  for (const [email, data] of emailRequestCounters.entries()) {
    if (now > data.resetAt) emailRequestCounters.delete(email);
  }
}, 5 * 60 * 1000);

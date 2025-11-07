import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { User } from '../models/User';

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found with this email' });
      return;
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial; padding: 20px; background: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="text-align:center;">Password Reset Request</h2>
            <p>Use the OTP below to reset your password:</p>
            <div style="text-align:center; padding: 20px; background:#fafafa;">
              <h1 style="font-size:32px; letter-spacing:6px; color:#f59e0b;">${otp}</h1>
            </div>
          </div>
        </div>`
    });

    res.status(200).json({ message: 'OTP sent to email successfully' });

  } catch (error: any) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const storedOtpData = otpStore.get(email);

    if (!storedOtpData) {
      res.status(400).json({ message: 'No OTP found for this email' });
      return;
    }
    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(email);
      res.status(400).json({ message: 'OTP has expired' });
      return;
    }
    if (storedOtpData.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    res.status(200).json({ message: 'OTP verified successfully' });

  } catch (error: any) {
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    const storedOtpData = otpStore.get(email);

    if (!storedOtpData || storedOtpData.otp !== otp) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(email);
      res.status(400).json({ message: 'OTP has expired' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    otpStore.delete(email);

    res.status(200).json({ message: 'Password reset successful' });

  } catch (error: any) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};

setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) otpStore.delete(email);
  }
}, 60000);

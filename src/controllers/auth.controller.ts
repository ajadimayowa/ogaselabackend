import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/Staff';
import crypto from 'crypto';
import { sendLoginNotificationEmail, sendLoginOtpEmail } from '../services/email/emailTypesHandler';


export const adminRegisterStaff = async (req: Request, res: Response) => {
    const { fullName, email, password} = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

// export const staffLogin = async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {res.status(400).json({ msg: 'Invalid credentials' })};

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
//     const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes;
//     const [firstName] = user.fullName.trim().split(' '); // Safely extract first name

//     user.loginOtp = otp;
//     user.loginOtpExpires = otpExpires;
//     await user.save();

//     // TODO: Send OTP via email/SMS
//     sendLoginOtpEmail(firstName,email,otp)
//     console.log(`OTP for ${user.email}: ${otp}`);

//     res.status(200).json({ success: true, message: 'OTP sent to your email' });
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// };

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid email or OTP' });

    if (!user.loginOtp || user.loginOtp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    if (user.loginOtpExpires && user.loginOtpExpires < new Date()) {
      return res.status(400).json({ msg: 'OTP has expired' });
    }

    // OTP is valid — clear it and login user
    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.status(200).json({ success: true, message: 'Login successful', payload:{token:token,userInfo:user}});
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
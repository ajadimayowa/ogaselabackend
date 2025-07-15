// controllers/auth/staffLogin.ts

import { Request, Response } from 'express';
import Staff from '../../models/Staff';
import { generateOtp } from '../../utils/otpUtils';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendLoginOtpEmail, sendResetPasswordOtpEmail } from '../../services/email/emailTypesHandler';

import Organization from '../../models/Organization';

export const loginStaff = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const staff = await Staff.findOne({ email });

    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff not found' });
      return
    }

    const otp = generateOtp(); // 6-digit OTP
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    staff.loginOtp = otp;
    staff.loginOtpExpires = otpExpires;
    await staff.save();

    try {
     await sendLoginOtpEmail(staff.firstName, staff.email, otp);
    } catch (error) {
      console.error('Error sending OTP email:', error);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      payload: {email:email}
    });
    return ;
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
    return 
  }
};

export const verifyLoginOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  // console.log({email, otp});

  try {
    const staff = await Staff.findOne({ email });
    console.log({seeStaffHere:staff})
    const organisation =Organization.findById(staff?.organization)

    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff not found' });
      return 
    }

    if (
      !staff.loginOtp ||
      staff.loginOtp !== otp ||
      !staff.loginOtpExpires ||
      staff.loginOtpExpires < new Date()
    ) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      return 
    }

    // Clear OTP
    staff.loginOtp = undefined;
    staff.loginOtpExpires = undefined;
    await staff.save();

    const payload = {
      id: staff.id,
      email: staff.email,
      userClass: staff.userClass,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

     const organization = await Organization.findById(staff.organization);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token:token,
      payload:{
      staffInfo:staff,
      organizationInfo: organization,
      }
    });
    return
  } catch (error:any) {
   res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    return
  }
};


export const requestPasswordResetOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const staff = await Staff.findOne({ email });

    if (!staff) {
      res.status(404).json({
        success: false,
        message: 'Staff with this email does not exist',
      });
      return ;
    }

    const otp = generateOtp(); // generate 6-digit OTP
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

    staff.resetPasswordOtp = otp;
    staff.loginOtp = undefined;
    staff.emailOtp = undefined;
    staff.loginOtpExpires = undefined;
    staff.emailOtpExpires = undefined;
    staff.emailIsVerified = false;
    staff.resetPasswordOtpExpires = otpExpires;

    await staff.save();

    try {
      await sendResetPasswordOtpEmail(staff.firstName, staff.email, otp);
    } catch (err) {
      console.error('Error sending reset OTP email:', err);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to email',
      payload: { email },
    });
    return ;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err,
    });
    return ;
  }
};

export const resetStaffPasswordWithOtp = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  let updatedOtp=+otp

  if (!email || !updatedOtp || !newPassword) {
    res.status(400).json({
      success: false,
      message: 'Email, OTP, and new password are required',
    });
    return ;
  }

  try {
    const staff = await Staff.findOne({ email });

    if (!staff) {
      res.status(404).json({
        success: false,
        message: 'Staff not found',
      });
      return 
    }

    if (
      !staff.resetPasswordOtp ||
      staff.resetPasswordOtp !== otp
      // !staff.resetPasswordOtpExpires ||
      // staff.resetPasswordOtpExpires < new Date()
    ) {
     res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
       return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    staff.password = hashedPassword;
    staff.resetPasswordOtp = undefined;
    staff.emailOtpExpires = undefined;
    staff.isPasswordUpdated = true;

    await staff.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
    return ;
  } catch (err) {
   res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err,
    });
     return ;
  }
};




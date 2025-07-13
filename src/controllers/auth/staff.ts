// controllers/auth/staffLogin.ts

import { Request, Response } from 'express';
import Staff from '../../models/Staff';
import { generateOtp } from '../../utils/otpUtils';
import jwt from 'jsonwebtoken';
import { sendLoginOtpEmail } from '../../services/email/emailTypesHandler';
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

export const verifyOtp = async (req: Request, res: Response) => {
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

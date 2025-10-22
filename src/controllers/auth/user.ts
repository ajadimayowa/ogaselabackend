// controllers/auth/staffLogin.ts

import { Request, Response } from 'express';
import UserModel from '../../models/User.model';
import { generateOtp } from '../../utils/otpUtils';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendLoginNotificationEmail, sendLoginOtpEmail, sendResetPasswordOtpEmail, sendWelcomeEmail } from '../../services/email/emailTypesHandler';

import { Organization } from '../../models/Organization';
import { Department } from '../../models/Department.model';
import Role from '../../models/Role';
import { sendLoginOtp } from '../../services/sms/smsSender';
import BusinessRule from '../../models/BusinessRule';
import * as crypto from "crypto";
import { sendUserRegistrationNotificationEmail } from '../../services/email/ogasela/usersEmailNotifs';
import { sendUserLoginNotificationEmail, sendUserLoginOtpNotificationEmail, sendUserPasswordResetNotificationEmail, sendUserPasswordResetOtpEmail } from '../../services/email/ogasela/userLoginOtpEmailNotifs';

export interface IApiResponse<T = any> {
  data: {
    success: boolean;
    message: string;
    payload?: T;
  },
  status: any

}


// ✅ Register New User
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;
    let properEmail:string = email.trim().toLowerCase() || ''

    // Check if user already exists
    const existingUser = await UserModel.findOne({ "contact.email": properEmail });
    if (existingUser) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const emailVerificationCode = generateOtp();
    const emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    let firstName = fullName.split(' ')[0]
    let lastName = fullName.split(' ')[1]
    const newUser = await UserModel.create({
      profile: { fullName, firstName, lastName, password: hashedPassword },
      contact: { email:properEmail, phoneNumber },
      emailVerificationToken:emailVerificationCode,
      emailVerificationExpires,
    });

    // Send email verification
    await sendUserRegistrationNotificationEmail({firstName,email:properEmail,emailVerificationCode});

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
      data: { id: newUser._id, email: newUser.contact.email },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

// ✅ VERIFY USER EMAIL
export const verifyUserEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query; // token sent in email link

    if (!token) {
      res.status(400).json({ message: "Verification token is required" });
      return;
    }

    // Find user by token
    const user = await UserModel.findOne({ emailVerificationToken: token });
    if (!user) {
      res.status(404).json({ message: "Invalid or expired verification token" });
      return;
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined; // clear the token

    // If phone number already verified elsewhere, keep it
    user.isPhoneVerified = user.isPhoneVerified || false;

    await user.save();

    // Send confirmation email
    // await sendEmailVerified(user.contact.email, user.profile.fullName);

    res.status(200).json({
      message: "Email verified successfully",
      data: {
        emailVerified: user.isEmailVerified,
        phoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Error verifying email", error });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ "contact.email": normalizedEmail });

    // To prevent timing attacks, run bcrypt.compare even if user doesn't exist
    const dummyHash = "$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    const isPasswordMatch = await bcrypt.compare(password, user?.profile.password || dummyHash);

    if (!user || !isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const otp = generateOtp(); // 6-digit OTP
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.loginOtp = otp;
    user.loginOtpExpires = otpExpires;
    await user.save();

    // await sendLoginOtp({
    //   to:staff.phoneNumber,
    //   code:+otp,
    //   firstName:staff.firstName
    // })
    try {
      await sendUserLoginOtpNotificationEmail({firstName:user.profile.firstName, email:user.contact.email, loginOtpCode:otp});
    } catch (error) {
      console.error('Error sending OTP email:', error);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      payload: {
        email: user.contact.email,
        expiresAt: otpExpires,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error,
    });
  }
};

export const verifyLoginOtp = async (req: Request, res: Response): Promise<any> => {
  const { email, otp } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  // console.log({email, otp});

  try {
    const user = await UserModel.findOne({ "contact.email": normalizedEmail })
    console.log({ seeStaffHere: user })
    // const organisation = Organization.findById(staff?.organization)

    if (!user) {
      res.status(404).json({ success: false, message: 'Staff not found' });
      return
    }

    if (
      !user.loginOtp ||
      user.loginOtp !== otp ||
      !user.loginOtpExpires ||
      user.loginOtpExpires < new Date()
    ) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      return
    }

    // Clear OTP
    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;
    await user.save();

    const payload = {
      id: user.id,
      email: user.contact.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      payload: {
        token: token,
        userBio: user
      }
    });
    await sendUserLoginNotificationEmail({firstName:user.profile.firstName,email:user.contact.email,loginOtpCode:otp});
    return
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    return
  }
};


export const requestPasswordResetOtp = async (req: Request, res: Response) => {

  const { email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await UserModel.findOne({ "contact.email": normalizedEmail });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Staff with this email does not exist',
      });
      return;
    }

    const otp = generateOtp(); // generate 6-digit OTP
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

    user.resetPasswordOtp = otp;
    user.loginOtp = undefined;
    user.emailVerificationToken = undefined;
    user.loginOtpExpires = undefined;
    user.resetPasswordOtpExpires = otpExpires;

    await user.save();

    try {
      await sendUserPasswordResetOtpEmail({firstName:user.profile.firstName, email:user.contact.email, passwordResetOtpCode:otp});
    } catch (err) {
      console.error('Error sending reset OTP email:', err);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to email',
      payload: { email },
    });
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err,
    });
    return;
  }
};

export const resetUserPasswordWithOtp = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  let updatedOtp = +otp

  if (!email || !updatedOtp || !newPassword) {
    res.status(400).json({
      success: false,
      message: 'Email, OTP, and new password are required',
    });
    
    return;
  }

  try {
    const staff = await UserModel.findOne({ "contact.email": email });

    if (!staff) {
      res.status(404).json({
        success: false,
        message: 'User not found',
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

    staff.profile.password = hashedPassword;
    staff.resetPasswordOtp = undefined;
    staff.emailVerificationToken = undefined;

    await staff.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
    await sendUserPasswordResetNotificationEmail({firstName:staff.profile.firstName,email:staff.contact.email,loginOtpCode:otp});
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err,
    });
    return;
  }
};




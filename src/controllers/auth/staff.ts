// controllers/auth/staffLogin.ts

import { Request, Response } from 'express';
import Staff from '../../models/Staff';
import { generateOtp } from '../../utils/otpUtils';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendLoginOtpEmail, sendResetPasswordOtpEmail } from '../../services/email/emailTypesHandler';

import {Organization} from '../../models/Organization';
import { Department } from '../../models/Department.model';
import Role from '../../models/Role';

export interface IApiResponse<T = any> {
  data: {
    success: boolean;
    message: string;
    payload?: T;
  },
  status:any

}

export const loginStaff = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const staff = await Staff.findOne({ email: normalizedEmail });

    // To prevent timing attacks, run bcrypt.compare even if user doesn't exist
    const dummyHash = "$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    const isPasswordMatch = await bcrypt.compare(password, staff?.password || dummyHash);

    if (!staff || !isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
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

    return res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      payload: {
        email: staff.email,
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

export const verifyLoginOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  // console.log({email, otp});

  try {
    const staff = await Staff.findOne({ email: email.trim().toLowerCase() })
  .populate("branch", "name"); // or "branchName" depending on your Branch schema
    console.log({ seeStaffHere: staff })
    // const organisation = Organization.findById(staff?.organization)

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
    const staffDepartment = await Department.findById(staff.department);
    const staffRole = await Role.findById(staff.roles[0]);

    let staffData = {
      id: staff?._id,
      fullName: staff?.fullName,
       branch: staff?.branch
    ? staff.branch
    : null,
      firstName: staff?.firstName,
      department: staff?.department,
      organization:staff.organization,
      role:staff.roles[0],
      staffLevel:staff?.staffLevel,
      userClass:staff.userClass,
      staffNokInformation:staff?.staffNok,
      staffKycInformation:staff?.staffKyc,
      homeAddress:staff?.homeAddress,
      phoneNumber:`0${staff?.phoneNumber}`,
      isApproved:staff?.isApproved,
      isDisabled:staff.isDisabled,
      emailIsVerified:staff?.emailIsVerified,
      isSuperAdmin:staff?.isSuperAdmin,
      isPasswordUpdated:staff?.isPasswordUpdated,
      lga:staff?.lga,
      state:staff?.state,
      createdAt: staff?.createdAt,
      updatedAt: staff?.updatedAt,
    };
    let organisationData = {
      id: organization?._id,
      nameOfOrg: organization?.name,
      orgEmail: organization?.email,
      orgAddress: organization?.address,
      orgLga: organization?.lga,
      orgState: organization?.state,
      orgPhoneNumber: `0${organization?.phoneNumber}`,
      orgSubscriptionPlan: organization?.subscriptionPlan,
      orgRegNumber: organization?.regNumber,
      createdAt: organization?.createdAt,
      updatedAt: organization?.updatedAt
    }
    let staffDepartmentData = {
      id: staffDepartment?.id,
      name: staffDepartment?.name,
    }

    let staffRoleData = {
      id: staffRole?.id,
      name: staffRole?.name,
      permisions: staffRole?.permissions
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      payload: {
        token: token,
        staffData,
        organisationData,
        staffDepartmentData,
        staffRoleData
      }
    });
    return
  } catch (error: any) {
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
      return;
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

export const resetStaffPasswordWithOtp = async (req: Request, res: Response) => {
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




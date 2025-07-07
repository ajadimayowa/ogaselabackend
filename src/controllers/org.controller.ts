import { NextFunction, Request, Response } from 'express';
import Organization from '../models/Organization';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { sendOrgWelcomeEmail } from '../services/email/emailTypesHandler';
import moment from 'moment';

export const createOrganization = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, address, phoneNumber, subscriptionPlan, orgRegNumber } = req.body;

    const exists = await Organization.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Organization already exists' });
    }

    const org = await Organization.create({
      name,
      email,
      address,
      phoneNumber,
      subscriptionPlan,
      orgRegNumber
    });

    // Send welcome email (don't block response if it fails)
    try {
      await sendOrgWelcomeEmail(name, email,moment().format('DD/MM/YYYY HH:MM A'));
    } catch (emailErr) {
      console.error('Error sending welcome email:', emailErr);
    }

    return res.status(201).json({ success: true, message: 'Organization created', payload: org });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', payload: err });
  }
};


export const updateOrganization = async (req: Request, res: Response): Promise<any> => {
  try {
    const { orgId } = req.params;
    const updateData = req.body;

    const updatedOrg = await Organization.findByIdAndUpdate(orgId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrg) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    return res.status(200).json({ success: true, message: 'Organization updated', payload: updatedOrg });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getOrganizationById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { orgId } = req.params;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    return res.status(200).json({ success: true, message: 'Organization found', payload: organization });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const deleteOrganization = async (req: Request, res: Response): Promise<any> => {
  try {
    const { orgId } = req.params;

    const deletedOrg = await Organization.findByIdAndDelete(orgId);
    if (!deletedOrg) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    return res.status(200).json({ success: true, message: 'Organization deleted', payload: deletedOrg });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};



export const onboardStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, password, organizationId, department, roles } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = new User({
      fullName,
      email,
      password: hashedPassword,
      organization: organizationId,
      department,
      roles,
      isSuperAdmin: false
    });

    await staff.save();

    res.status(201).json({ msg: 'Staff onboarded', staff });
  } catch (err) {
    // next(err);
    res.status(500).json({ msg: 'Error onboarding staff' });
  }
};
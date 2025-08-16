import { NextFunction, Request, Response } from 'express';
import { Organization } from '../../models/Organization';
import Staff from '../../models/Staff';
import bcrypt from 'bcryptjs';
import { sendOrganizationCreatedEmail } from '../../services/email/organization/organization-emailNotifs';
import moment from 'moment';
import { Creator } from '../../models/Creator.model';

export const createOrganization = async (req: Request, res: Response): Promise<any> => {
  const {
      address,
      createdBy,
      description,
      email,
      lga,
      name,
      phoneNumber,
      regNumber,
      state
    } = req.body;
  
const normalizedEmail = email.trim().toLowerCase();
const trimmedName = name.trim();
  try {
    const creator = await Creator.findById(createdBy);
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Un Authorized!' });
    }

    // if( !creatorPass || creatorPass !== process.env.CREATOR_PASS){
    //   return res.status(400).json({ success: false, message: 'Un Authorized!' });
    // }

const exists = await Organization.findOne({ name: name.trim(), email: email.trim().toLowerCase() });
if (exists) {
  return res.status(400).json({ message: "Organization already exists" });
}


    const org = await Organization.create({
      name: trimmedName,
      email: normalizedEmail,
      address: address.trim(),
      lga,
      state,
      phoneNumber,
      regNumber: regNumber.trim(),
      description,
      createdBy,
    });


    try {
      await sendOrganizationCreatedEmail({
        name: org.name,
        regNumber: org.regNumber,
        email: org.email,
        address: org.address,
        lga: org.lga,
        state: org.state,
        phoneNumber:`+234${org.phoneNumber}`,
        createdByName: creator.fullName,
        createdByEmail: creator.email,
        logoUrl: 'https://wok9jamedia.s3.eu-north-1.amazonaws.com/fsh-logo+(1).png',
        footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/fsh-email-temp-footer.png'
      });
    } catch (emailErr) {
      console.error('Error sending welcome email:', emailErr);
    }

    return res.status(201).json({ success: true, message: 'Organization created', payload: org });

  } catch (err) {
    console.error('Error creating organization:', err);
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

export const getOrganizations = async (req: Request, res: Response):Promise<any> => {
  try {
    // Pagination defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const filter: any = {};

    // Date created filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    // Status filter
    if (req.query.isDisabled !== undefined) {
      filter.isDisabled = req.query.isDisabled === 'true';
    }
    if (req.query.isDeleted !== undefined) {
      filter.isDeleted = req.query.isDeleted === 'true';
    }

    // Subscription plan filter
    if (req.query.subscriptionPlan) {
      filter.subscriptionPlan = req.query.subscriptionPlan;
    }

    // Fetch data
    const organizations = await Organization.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // newest first

    const total = await Organization.countDocuments(filter);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      payload: organizations
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
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

    const staff = new Staff({
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
import { Request, Response } from 'express';
import Role from '../models/Role';
import { IRole } from '../interfaces/role.interface';
import { sendDeptCreationEmail, sendRoleCreationEmail } from '../services/email/emailTypesHandler';
import moment from 'moment';
import Organization from '../models/Organization';

export const createSuperAdminRole = async (req: Request, res: Response) => {
  const {
    roleName,
    roleDepartment,
    organization,
    rolePermissions,
    roleCreatedByName,
    roleCreatedById,
    approvedByName,
    isApproved,
    approvedById,
    isDisabled,
    roleDescription,
    creatorPass } = req.body;

  // console.log({ sent: req.body });
  try {
    const organizationExists = await Organization.findById(organization);
    if (!organizationExists) {
      res.status(400).json({ success: false, message: 'Organization does not exist' });
      return;
    }
    const exists = await Role.findOne({ roleName, roleDepartment });
    if (exists) {
      res.status(400).json({ success: false, message: 'Role already exists' });
      return;
    }

    const role: Partial<IRole> = await Role.create({
    roleName,
    roleDepartment,
    organization,
    rolePermissions,
    roleCreatedBy:{
      roleCreatedByName,
      roleCreatedById,
    },
    approvedBy: {
      approvedByName,
      approvedById,
    },
    isApproved,
    isDisabled,
    roleDescription,
    });


    const props = {
      nameOfOrg: organizationExists.nameOfOrg,
      orgEmail: organizationExists.orgEmail, // You can set the organization's email here
      nameOfRole: roleName,
      currentTime: moment().format('DD/MM/YYYY HH:MM A')
    }

    try {
      await sendRoleCreationEmail(props)
    } catch (error) {
      console.error('Error sending role creation email:', error);

    }

    res.status(201).json({ success: true, message: 'Role Created!', payload: role });

  } catch (err) {
    res.status(500).json({ success: true, message: 'Failed tp create role', payload: err });
  }
};

export const createRole = async (req: Request, res: Response) => {
  const { organization, roleDepartment, roleName, rolePermissions, roleCreatedByName, roleCreatedById, roleDescription, creatorId } = req.body;

  console.log({ sent: req.body });
  try {
    const organizationExists = await Organization.findById(organization);
    if (!organizationExists) {
      res.status(400).json({ success: false, message: 'Organization does not exist' });
      return;
    }
    const exists = await Role.findOne({ roleName, roleDepartment });
    if (exists) {
      res.status(400).json({ success: false, message: 'Role already exists' });
      return;
    }

    const role: Partial<IRole> = await Role.create({
     ...req.body
    });


    const props = {
      nameOfOrg: organizationExists.nameOfOrg,
      orgEmail: organizationExists.orgEmail, // You can set the organization's email here
      nameOfRole: roleName,
      currentTime: moment().format('DD/MM/YYYY HH:MM A')
    }

    try {
      await sendRoleCreationEmail(props)
    } catch (error) {
      console.error('Error sending role creation email:', error);

    }

    res.status(201).json({ success: false, message: 'Role Created!', payload: role });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed tp create role', payload: err });
  }
};

export const getRolesByDepartment = async (req: Request, res: Response) => {
  const { departmentId } = req.params;

  try {
    const roles = await Role.find({ department: departmentId });
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch roles' });
  }
};

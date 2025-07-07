import { Request, Response } from 'express';
import Role from '../models/Role';
import { IRole } from '../interfaces/role.interface';
import { sendDeptCreationEmail, sendRoleCreationEmail } from '../services/email/emailTypesHandler';
import moment from 'moment';

export const createSuperAdminRole = async (req: Request, res: Response) => {
  const { name, organization, department,permissions, createdByName,createdById,description,creatorId } = req.body;
  console.log({sent: req.body});
  try {
  if (creatorId != process.env.CREATOR_ID) {
    res.status(401).json({ success: false, message: 'Un Authorised Access' });
    return;
  }
  const exists = await Role.findOne({ name });
  if (exists) {
    res.status(400).json({ success: false, message: 'Role already exists' });
    return;
  }

    const role: Partial<IRole> = await Role.create({...req.body});

    // // Send welcome email (don't block response if it fails)
    //     try {
    //       // (name, email,moment().format('DD/MM/YYYY HH:MM A'));
    //       await sendDeptCreationEmail('Float Solution Hub', 'ajadimayowa879@gmail.com', name, moment().format('DD/MM/YYYY HH:MM A'))
    //     } catch (emailErr) {
    //       console.error('Error sending welcome email:', emailErr);
    //     }


    const props = {
      nameOfOrg: organization,
      orgEmail: 'ajadimayowa879@gmail.com', // You can set the organization's email here
      nameOfRole: name,
      currentTime: moment().format('DD/MM/YYYY HH:MM A')}

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
  
  const {
    name,
    department,
    organization,
    permissions,
    isSuperAdmin,
    createdByName,
    userClass,
    createdById,
    description
  } = req.body;

  if (!isSuperAdmin && userClass != 'initiator') {
    res.status(401).json({ success: false, message: 'Un Authorised' });
  }
  const exists = await Role.findOne({ name });
  if (exists) {
    res.status(400).json({ success: false, message: 'Role already exists' });
  }
  try {
    const role: Partial<IRole> = await Role.create({
      name,
      department,
      organization,
      permissions,
      createdBy: {
        createdById,
        createdByName
      },
      description
    });
    res.status(201).json({ success: true, message: 'Role Created!', payload: role });
  } catch (err) {
    res.status(500).json({ success: true, message: 'Failed tp create role', payload: err });
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

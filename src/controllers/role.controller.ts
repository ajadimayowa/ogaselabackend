import { Request, Response } from 'express';
import Role from '../models/Role';
import { IRole } from '../interfaces/role.interface';
import { sendDeptCreationEmail, sendRoleCreationEmail } from '../services/email/emailTypesHandler';
import moment from 'moment';
import {Organization} from '../models/Organization';

export const createSuperAdminRole = async (req: Request, res: Response):Promise<any> => {
  try {
    const {
      organization,
      department,
      name,
      createdBy,
      createdByModel,
      description,
    } = req.body;

    console.log({ received: req.body });

    // Check if organization exists
    const organizationExists = await Organization.findById(organization);
    if (!organizationExists) {
     return res.status(400).json({ success: false, message: 'Organization does not exist' });
    
    }

    // Check if role with same name and department already exists
    const existingRole = await Role.findOne({ name, department,organization });
    if (existingRole) {
      return res.status(400).json({ success: false, message: 'Role already exists' });
    }
    
    const role = await Role.create(
      {
        name:name.trim(),
        department,
        organization,
        createdBy,
        createdByModel,
        permissions:['all.access'],
        description
      }
    );
    return res.status(201).json({ success: true, message: 'Role created successfully', payload: role });
    

  } catch (err) {
    console.error('Error creating role:', err);
   return res.status(500).json({ success: false, message: 'Failed to create role', payload: err });
  
  }
};

export const createRole = async (req: Request, res: Response):Promise<any> => {
  try {
    const {
      organization,
      department,
      name,
      createdBy,
      createdByModel,
      description,
    } = req.body;

    console.log({ received: req.body });

    // Check if organization exists
    const organizationExists = await Organization.findById(organization);
    if (!organizationExists) {
     return res.status(400).json({ success: false, message: 'Organization does not exist' });
    
    }

    // Check if role with same name and department already exists
    const existingRole = await Role.findOne({ name, department,organization });
    if (existingRole) {
      return res.status(400).json({ success: false, message: 'Role already exists' });
    }
    
    const role = await Role.create(
      {
        name:name.trim(),
        department,
        organization,
        createdBy,
        createdByModel,
        permissions:[],
        description
      }
    );
    return res.status(201).json({ success: true, message: 'Role created successfully', payload: role });
    

  } catch (err) {
    console.error('Error creating role:', err);
   return res.status(500).json({ success: false, message: 'Failed to create role', payload: err });
  
  }
};

export const getRolesController = async (req: Request, res: Response): Promise<any> => {
  try {
    const { departmentId, organizationId, status, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter: Record<string, any> = {};

    if (departmentId) filter.department = departmentId;
    if (organizationId) filter.organization = organizationId;
    if (status) filter.status = status; // Assuming `status` is a field in your Role schema

    // Pagination calculations
    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageLimit;

    // Query database
    const [roles, total] = await Promise.all([
      Role.find(filter)
        .populate('department')
        .populate('organization')
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 }), // latest first

      Role.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Roles fetched successfully',
      payload: {
        data:roles,
        pagination: {
          total,
          page: pageNumber,
          limit: pageLimit,
          totalPages: Math.ceil(total / pageLimit)
        }
      }
    });

  } catch (err) {
    console.error('Error fetching roles:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      payload: err
    });
  }
};

export const getRolesByDepartment = async (req: Request, res: Response):Promise<any> => {
  const { departmentId } = req.params;

  try {
    const roles = await Role.find({ roleDepartment: departmentId });
    let roleData = roles.map((role)=>({
      value:role._id,
      label:role.name
    }))
    return res.status(200).json({success:true,payload:roleData});
  } catch (err) {
   return res.status(500).json({success:false, message: 'Failed to fetch roles',payload:err });
  }
};

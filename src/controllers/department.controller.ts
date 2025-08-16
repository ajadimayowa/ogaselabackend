// controllers/department.controller.ts
import { Request, Response } from 'express';
import { Department } from '../models/Department.model';
import { sendDeptCreationEmail } from '../services/email/emailTypesHandler';
import moment from 'moment';
import { IDepartment } from '../interfaces/department.interface';
import {Organization} from '../models/Organization';
import { Creator } from '../models/Creator.model';
import { sendOrganizationCreatedEmail, sendOrgDeptCreationEmail } from '../services/email/organization/organization-emailNotifs';
import mongoose from 'mongoose';
import Staff from '../models/Staff';



export const createAdminDepartment = async (req: Request, res: Response): Promise<any> => {
  const {
      name,
      organizationId,
      createdById,
      description,
      createdByModel 
    } = req.body;
  try {
    

    const creatorExist = await Creator.findById(createdById);
    if(!creatorExist) {
      return res.status(400).json({
        success: false,
        message: 'Un Authorized Access'
      });
    }
    const isDuplicate = await Department.findOne({ name, organization: organizationId });
    if(isDuplicate){
      return res.status(400).json({
        success: false,
        message: 'Department already exists'
      });
    }

    // 🏢 Check if organization exists
    const orgExists = await Organization.findById(organizationId);
    if (!orgExists) {
      return res.status(400).json({
        success: false,
        message: 'Organization does not exist'
      });
    }

    await Organization.create({
      name,
      organizationId,
      createdBy: createdById,
      createdByModel,
      description,
    })

   await sendOrgDeptCreationEmail({
      nameOfDept:name,
      nameOfOrg: orgExists.name,
      orgEmail:orgExists.email,
      createdByName: creatorExist.fullName,
      createdByEmail: creatorExist.email,
      orgPrimaryColor: orgExists.primaryColor || '#ffffff',
        logoUrl: 'https://wok9jamedia.s3.eu-north-1.amazonaws.com/fsh-logo+(1).png',
        footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/fsh-email-temp-footer.png'
    })


    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      payload: {}
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      payload: err
    });
  }
};



export const createDepartment = async (req: Request, res: Response) :Promise<any>=> {
  const { nameOfDept,organizationId,createdBy,description,createdByModel} = req.body;

  try {
    
    let userExist = await Creator.findById(createdBy);
if (!userExist) {
  userExist = await Staff.findById(createdBy);
}

    if(!userExist) {
      return res.status(400).json({ success: false, message: 'Un Authorized Access' });
    }

    const orgExist = await Organization.findById(organizationId);
    
    if(!orgExist) {
      res.status(400).json({ success: false, message: 'Un Authorized Access' });
      return res.json({ success: false, message: 'Un Authorized Access' });
    }

    const exists = await Department.findOne({ nameOfDept, organization: organizationId });
    if (exists) {
      res.status(400).json({ success: false, message: 'Department already exists' });
      return ;
    }
    await Department.create({
      name:nameOfDept,
      organization: organizationId,
      createdBy,
      createdByModel,
      description,
    });

     try {
      await sendOrgDeptCreationEmail({
        nameOfDept,
        createdByName: userExist.fullName,
        createdByEmail: userExist.email,
        nameOfOrg: orgExist.name,
        orgEmail: orgExist.email,
        logoUrl: 'https://wok9jamedia.s3.eu-north-1.amazonaws.com/fsh-logo+(1).png',
        footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/fsh-email-temp-footer.png'
      });
    } catch (emailErr) {
      console.error('Error sending welcome email:', emailErr);
    }

    res.status(201).json({ success: true, message: 'Department Created!', payload: {}});
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating department', payload: error });
  }
};

export const getDepartments = async (req: Request, res: Response): Promise<any> => {
  try {
    let {
      page = "1",
      limit = "10",
      organizationId,
      searchByName,
      statusOf,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId as string)) {
      return res.status(400).json({
        success: false,
        message: "Valid organizationId is required",
      });
    }

    // Build filters with proper ObjectId
    const filters: any = {
      organization: new mongoose.Types.ObjectId(organizationId as string),
    };

    if (searchByName) {
      filters.name = { $regex: searchByName as string, $options: "i" };
    }

    if (statusOf !== undefined) {
      filters.isApproved = statusOf === "true";
    }

    const [departments, total] = await Promise.all([
      Department.find(filters)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Department.countDocuments(filters),
    ]);

    // let filteredDept = departments.map((dept)=>dept.name!=='S')
    return res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      payload: departments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error,
    });
  }
};

export const getSingleDeptById = async (req: Request, res: Response): Promise<any>  => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid department ID" });
    }

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    return res.status(200).json({ success: true, message: "Department fetched", data: department });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<any>  => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid department ID" });
    }

    const department = await Department.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    return res.status(200).json({ success: true, message: "Department updated", data: department });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const getDepartmentsByOrganizationId = async (req: Request, res: Response): Promise<any>  => {
  try {
    const { organizationId } = req.params;
    const departments = await Department.find({ organization: organizationId });

    if (!departments || departments.length === 0) {
      res.status(404).json({ message: 'No departments found for this organization.' });
    }

    let depts = departments.map((depts)=>({
      value:depts._id,
      label:depts.name
    }))

    res.status(200).json({success:true,payload:depts});
  } catch (error) {
    res.status(500).json({success:false, message: 'Error fetching departments by organization ID', payload:error });
  }
};


export const getAllDepartments = async (req: Request, res: Response) : Promise<any> => {
  try {
    const departments = await Department.find().populate('organization');
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const department = await Department.findById(req.params.id).populate('organization');
    if (!department) res.status(404).json({ message: 'Department not found' });
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department', error });
  }
};

export const deleteDepartment = async (req: Request, res: Response): Promise<any>  => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) res.status(404).json({ message: 'Department not found' });
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error });
  }
};
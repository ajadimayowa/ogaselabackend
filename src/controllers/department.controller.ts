// controllers/department.controller.ts
import { Request, Response } from 'express';
import { Department } from '../models/Department.model';
import { sendDeptCreationEmail } from '../services/email/emailTypesHandler';
import moment from 'moment';
import { IDepartment } from '../interfaces/department.interface';


export const createAdminDepartment = async (req: Request, res: Response) => {

  try {
    const { name, organization, createdByName, isApproved, createdById, approvedByName, approvedById, description, creatorId } = req.body;

    if (creatorId != process.env.CREATOR_ID) {
      res.status(401).json({ success: false, message: 'Un Authorised Access' });
    }
    const exists = await Department.findOne({ name });
    if (exists) {
      res.status(400).json({ success: false, message: 'Department already exists' });
    }
    const dept: Partial<IDepartment> = await Department.create({
      name,
      organization,
      createdBy: {
        createdByName,
        createdById
      },
      approvedBy: {
        approvedByName,
        approvedById
      },
      isApproved,
      description,
    });

    // Send welcome email (don't block response if it fails)
    try {
      // (name, email,moment().format('DD/MM/YYYY HH:MM A'));
      await sendDeptCreationEmail('Float Solution Hub', 'hello@floatsolutionhub.com', name, moment().format('DD/MM/YYYY HH:MM A'))
    } catch (emailErr) {
      console.error('Error sending welcome email:', emailErr);
    }
    res.status(201).json({ success: true, message: 'Department Created!', payload: dept });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating department', payload: error });
  }
};


export const createDepartment = async (req: Request, res: Response) => {

  try {
    const { name, organisation, createdByName, isApproved, createdById, approvedByName, approvedById, description } = req.body;

    const exists = await Department.findOne({ name });
    if (exists) {
      res.status(400).json({ success: false, message: 'Department already exists' });
    }
    const dept = await Department.create({
      name,
      organisation,
      createdByName,
      createdById,
      isApproved,
      approvedByName,
      approvedById,
      description,
    });

    // Send welcome email (don't block response if it fails)
    try {
      // (name, email,moment().format('DD/MM/YYYY HH:MM A'));
      await sendDeptCreationEmail('Float Solution Hub', name, 'hello@floatsolutionhub.com', moment().format('DD/MM/YYYY HH:MM A'))
    } catch (emailErr) {
      console.error('Error sending welcome email:', emailErr);
    }
    res.status(201).json({ success: true, message: 'Department Created!', payload: dept });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating department', payload: error });
  }
};

export const getDepartmentsByOrganizationId = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;
    const departments = await Department.find({ organization: organizationId });

    if (!departments || departments.length === 0) {
      res.status(404).json({ message: 'No departments found for this organization.' });
    }

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments by organization ID', error });
  }
};


export const getAllDepartments = async (req: Request, res: Response) => {
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

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) res.status(404).json({ message: 'Department not found' });
    res.status(200).json(department);
  } catch (error) {
    res.status(400).json({ message: 'Error updating department', error });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) res.status(404).json({ message: 'Department not found' });
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error });
  }
};
import { Request, Response } from 'express';
import User from '../models/User';
import Role from '../models/Role';

// Assign roles to a user
export const assignRolesToUser  = async (req: Request, res: Response) : Promise<any> =>  {
  const { userId, roleIds } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.roles = [...new Set([...(user.roles ?? []), ...roleIds])];
    await user.save();

    res.status(200).json({ msg: 'Roles assigned', roles: user.roles });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to assign roles' });
  }
};  

// Remove roles from a user
export const removeRolesFromUser = async (req: Request, res: Response) : Promise<any> => {
  const { userId, roleIds } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.roles = (user.roles ?? []).filter(r => !roleIds.includes(r.toString()));
    await user.save();

    res.status(200).json({ msg: 'Roles removed', roles: user.roles });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to remove roles' });
  }
};
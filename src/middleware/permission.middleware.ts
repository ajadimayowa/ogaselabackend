import { Request, Response, NextFunction } from 'express';
import Role from '../models/Role';

export const hasPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    try {
      const roles = await Role.find({ _id: { $in: user.roles } });

      const allPermissions = roles.flatMap(role => role.permissions || []);
      if (!allPermissions.includes(requiredPermission)) {
        return res.status(403).json({ msg: 'Permission denied' });
      }

      next();
    } catch (err) {
      res.status(500).json({ msg: 'Permission check failed' });
    }
  };
};
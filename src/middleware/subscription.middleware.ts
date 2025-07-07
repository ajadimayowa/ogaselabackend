// src/middleware/subscription.middleware.ts
import { Request, Response, NextFunction } from 'express';
import Organization from '../models/Organization';

export const checkModuleAccess = (requiredPlan: 'basic' | 'pro') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    try {
      const org = await Organization.findById(user.organization);
      if (!org) return res.status(404).json({ msg: 'Organization not found' });

      const plans = ['free', 'basic', 'pro'];
      const hasAccess = plans.indexOf(org.subscriptionPlan) >= plans.indexOf(requiredPlan);

      if (!hasAccess) {
        return res.status(403).json({ msg: `Access denied. ${requiredPlan} plan required.` });
      }
      next();
    } catch (err) {
      res.status(500).json({ msg: 'Access check failed' });
    }
  };
};
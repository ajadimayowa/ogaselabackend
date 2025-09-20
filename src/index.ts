import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/organization/org.routes';
import roleRoutes from './routes/role.routes';
import userRoleRoutes from './routes/userRole.routes';
import departmentRoutes from './routes/department.routes';
import staffRoutes from './routes/staff/staff.routes';
import stateRoutes from './routes/stateRoutes';
import branchRoutes from './routes/branch-routes/branch.routes';
import creatorRoutes from './routes/creator/creator.routes';
import permissionRoutes from './routes/permissions/permission.route';
import groupRoutes from './routes/group-routes/groupRoutes.routes';
import memberRoutes from './routes/customer-routes/customer.routes';
import businessRuleRoutes from './routes/business/business-rule.routes';
import loanRoutes from './routes/loanRoutes/loan.routes'

dotenv.config();

// Connect to DB
connectDB().catch((err) => {
  console.error('Failed to connect to DB:', err.message);
  process.exit(1);
});

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

const apiPrefix = '/api/v1/';

// Routes
app.use(apiPrefix, creatorRoutes);
app.use(apiPrefix, orgRoutes);
app.use(apiPrefix, branchRoutes);
app.use(apiPrefix, departmentRoutes);
app.use(apiPrefix, roleRoutes);
app.use(apiPrefix, staffRoutes);
app.use(apiPrefix, authRoutes);
app.use(apiPrefix, userRoleRoutes);
app.use(apiPrefix, stateRoutes);
app.use(apiPrefix, permissionRoutes);
app.use(apiPrefix, groupRoutes);
app.use(apiPrefix, memberRoutes);
app.use(apiPrefix, businessRuleRoutes);
app.use(apiPrefix, loanRoutes);



// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

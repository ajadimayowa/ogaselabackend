import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/org.routes';
import roleRoutes from './routes/role.routes';
import userRoleRoutes from './routes/userRole.routes';
import departmentRoutes from './routes/department.routes';
import staffRoutes from './routes/staff.routes';
import stateRoutes from './routes/stateRoutes';

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
app.use(apiPrefix, orgRoutes);
app.use(apiPrefix, departmentRoutes);
app.use(apiPrefix, roleRoutes);
app.use(apiPrefix, staffRoutes);
app.use(apiPrefix, authRoutes);
app.use(apiPrefix, userRoleRoutes);
app.use(apiPrefix, stateRoutes); // updated

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/org.routes';
import roleRoutes from './routes/role.routes';
import userRoleRoutes from './routes/userRole.routes';
import departmentRoutes from './routes/department.routes';
import staffRoutes from './routes/staff.routes';
import stateRoutes from './routes/stateRoutes';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/org', orgRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user-role', userRoleRoutes);


app.use('/api', stateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
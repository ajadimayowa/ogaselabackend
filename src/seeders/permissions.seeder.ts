import mongoose from 'mongoose';
import { GLOBAL_PERMISSIONS } from '../constants/permissions';
import { Permission } from '../models/Permissions.model';
import dotenv from 'dotenv';

dotenv.config();

async function seedPermissions() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    for (const perm of GLOBAL_PERMISSIONS) {
      const exists = await Permission.findOne({ name: perm.name });
      if (!exists) {
        await Permission.create(perm);
        console.log(`✅ Added permission: ${perm.name}`);
      } else {
        console.log(`⚠️ Skipped existing: ${perm.name}`);
      }
    }

    console.log('🌱 Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedPermissions();
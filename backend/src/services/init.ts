import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from '../config';

const prisma = new PrismaClient();

export const initializeAdmin = async () => {
  const hashedPassword = await bcrypt.hash(config.INITIAL_ADMIN_PASSWORD, 10);
  
  return prisma.adminSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      adminPassword: hashedPassword
    }
  });
};

export const getAdminSettings = async () => {
  return prisma.adminSettings.findFirst();
};

export const updateAdminPassword = async (newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  return prisma.adminSettings.update({
    where: { id: 'default' },
    data: { adminPassword: hashedPassword }
  });
}; 
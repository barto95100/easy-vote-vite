import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const setAdminPassword = async () => {
  try {
    const password = await new Promise<string>((resolve) => {
      rl.question('Entrez le mot de passe administrateur : ', resolve);
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.adminSettings.upsert({
      where: { id: 'default' },
      update: { adminPassword: hashedPassword },
      create: {
        id: 'default',
        adminPassword: hashedPassword
      }
    });

    console.log('✅ Mot de passe administrateur configuré avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
};

setAdminPassword(); 
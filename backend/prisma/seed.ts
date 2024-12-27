import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hasher le mot de passe admin
  const hashedPassword = await bcrypt.hash('admin123', 10); // Vous pouvez changer 'admin123' par le mot de passe souhaité

  // Créer ou mettre à jour l'administrateur
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword
    },
    create: {
      username: 'admin',
      password: hashedPassword
    }
  });

  console.log('✅ Compte administrateur créé/mis à jour');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
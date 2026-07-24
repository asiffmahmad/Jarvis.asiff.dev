import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Default User & Settings
  const adminEmail = 'admin@jarvis.ai';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        name: 'Tony Stark',
        email: adminEmail,
        password: 'hashed_password_mock', // Mock password for now
        role: 'admin',
        settings: {
          create: {
            preferences: {
              appearance: {
                theme: 'dark',
                accentColor: '#34F5D0',
                density: 'comfortable',
                sidebarDensity: 'comfortable',
                reducedMotion: false,
                animations: true,
              },
              profile: {
                timeZone: 'UTC',
                language: 'en-US',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '24h'
              },
              security: {
                sessionTimeoutMinutes: 60,
                requireMfa: false
              },
              notifications: {
                inApp: true,
                email: true,
                workflows: true,
                agents: true,
                scheduler: true,
                alerts: true
              }
            }
          }
        }
      }
    });
    console.log(`Created admin user: ${admin.email}`);
  }

  // 2. Default Prompt Categories
  const promptCategories = ['System', 'Copywriting', 'Development', 'Analysis'];
  for (const name of promptCategories) {
    await prisma.promptCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Created default prompt categories.');

  // 3. Default Feed Categories
  const feedCategories = ['AI Research', 'Tech News', 'Engineering'];
  for (const name of feedCategories) {
    await prisma.feedCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Created default feed categories.');

  // 4. Default Tags
  const defaultTags = [
    { name: 'critical', color: '#FF4D4D' },
    { name: 'architecture', color: '#F5A623' },
    { name: 'concept', color: '#34F5D0' },
  ];
  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }
  console.log('Created default tags.');

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

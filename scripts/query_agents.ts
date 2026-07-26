import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const agents = await prisma.agent.findMany();
  console.log("Agents in DB:", JSON.stringify(agents, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());

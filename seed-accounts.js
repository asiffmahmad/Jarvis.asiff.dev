const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.platformAccount.createMany({
    data: [
      {
        id: "acc_li_1",
        userId: "user_1",
        platformId: "linkedin",
        platformUserId: "li_user_1",
        accessToken: "mock_token",
        accountName: "Tony Stark",
        handle: "@ironman",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tony",
        status: "active",
      },
      {
        id: "acc_ig_1",
        userId: "user_1",
        platformId: "instagram",
        platformUserId: "ig_user_1",
        accessToken: "mock_token",
        accountName: "Stark Industries",
        handle: "@starkindustries",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=stark",
        status: "active",
      },
      {
        id: "acc_x_1",
        userId: "user_1",
        platformId: "x",
        platformUserId: "x_user_1",
        accessToken: "mock_token",
        accountName: "Tony Stark",
        handle: "@tonystark",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tonyx",
        status: "active",
      },
    ],
    skipDuplicates: true,
  });
  console.log("Mock accounts seeded!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

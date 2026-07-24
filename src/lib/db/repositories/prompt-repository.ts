import prisma from '../prisma';

export class PromptRepository {
  async getPrompts(userId: string) {
    return prisma.prompt.findMany({
      where: { userId },
      include: {
        category: true,
        versions: {
          where: { isActive: true },
          take: 1
        }
      }
    });
  }

  async getPromptCategories() {
    return prisma.promptCategory.findMany();
  }

  async createPrompt(userId: string, categoryId: string, title: string, content: string, description?: string) {
    return prisma.prompt.create({
      data: {
        userId,
        categoryId,
        title,
        description,
        versions: {
          create: {
            content,
            version: 1,
            isActive: true
          }
        }
      },
      include: {
        category: true,
        versions: true
      }
    });
  }
}

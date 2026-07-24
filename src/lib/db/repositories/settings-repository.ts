import prisma from '../prisma';
import type { Prisma } from '@prisma/client';
import type { JARVISSettings } from '@/lib/settings/types';

export class SettingsRepository {
  /**
   * Upserts the global settings for a user.
   */
  async upsertSettings(userId: string, preferences: JARVISSettings) {
    return prisma.settings.upsert({
      where: { userId },
      update: {
        preferences: preferences as unknown as Prisma.InputJsonValue
      },
      create: {
        userId,
        preferences: preferences as unknown as Prisma.InputJsonValue
      }
    });
  }

  /**
   * Retrieves the global settings for a user.
   */
  async getSettings(userId: string) {
    return prisma.settings.findUnique({
      where: { userId }
    });
  }
}

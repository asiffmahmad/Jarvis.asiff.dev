/**
 * JARVIS Content Automation Suite — Database Module
 *
 * This module will contain the database client, schema definitions,
 * and query utilities. The specific ORM/driver will be configured
 * when the database provider is selected.
 *
 * Supported providers (future):
 * - PostgreSQL via Prisma / Drizzle
 * - PlanetScale
 * - Supabase
 * - Neon
 */

export const DB_MODULE_READY = false;

export function getDatabaseStatus(): { connected: boolean; provider: string | null } {
  return {
    connected: false,
    provider: null,
  };
}

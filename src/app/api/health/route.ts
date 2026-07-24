/**
 * JARVIS API — Health Check
 *
 * Returns the current health status of the application.
 * Used by monitoring systems and the dashboard system status widget.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? "development",
  };

  return NextResponse.json(health, { status: 200 });
}

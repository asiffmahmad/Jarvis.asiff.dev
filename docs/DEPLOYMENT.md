# Deployment Guide

This guide covers deploying the JARVIS Operating System to **Vercel**, the recommended hosting provider for Next.js applications.

## Prerequisites
- A Vercel Account.
- A GitHub repository containing the JARVIS codebase.
- A provisioned TiDB Cloud Serverless (MySQL) database.

## Vercel Setup

1. **Import Project**
   - Connect your GitHub account to Vercel.
   - Import the `Automation Tool` repository.

2. **Configure Build Settings**
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run db:generate && npm run build`
   - **Install Command:** `npm install`
   - **Output Directory:** `.next`

3. **Environment Variables**
   - Bulk copy the contents of `.env.local` into the Vercel Environment Variables UI.
   - **CRITICAL:** Ensure `DATABASE_URL` includes `?sslaccept=strict`.
   - **CRITICAL:** Set `NODE_ENV` to `production`.

## Database Migrations in CI/CD
Because we are using TiDB Cloud Serverless, rapid deployment pipelines should utilize `npx prisma db push` or pre-compiled migration SQL scripts depending on strictness.
Currently, Prisma is configured to run `generate` during the Vercel build step, ensuring the Serverless Functions have the compiled client.

## Monitoring & Troubleshooting
- Use Vercel Analytics for Web Vitals monitoring.
- Check Vercel Function Logs for any Server Component crashes.
- If the database connection times out, verify the TiDB cluster has not paused due to inactivity, and ensure IP Access Lists (if configured) allow Vercel's IP ranges.

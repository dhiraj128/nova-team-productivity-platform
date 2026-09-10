import { PrismaClient } from '@prisma/client';

function sanitizeDatabaseUrl(url?: string): string | undefined {
  if (!url) return undefined;
  let cleaned = url.trim().replace(/^["']|["']$/g, '');
  if (!cleaned) return undefined;

  const atCount = (cleaned.match(/@/g) || []).length;
  if (atCount > 1) {
    const schemeEnd = cleaned.indexOf('://');
    if (schemeEnd !== -1) {
      const scheme = cleaned.substring(0, schemeEnd + 3);
      const rest = cleaned.substring(schemeEnd + 3);
      const lastAt = rest.lastIndexOf('@');
      if (lastAt !== -1) {
        const userPass = rest.substring(0, lastAt);
        const hostPath = rest.substring(lastAt + 1);
        const colonIdx = userPass.indexOf(':');
        if (colonIdx !== -1) {
          const user = userPass.substring(0, colonIdx);
          const rawPass = userPass.substring(colonIdx + 1);
          const encodedPass = encodeURIComponent(decodeURIComponent(rawPass));
          cleaned = `${scheme}${user}:${encodedPass}@${hostPath}`;
        }
      }
    }
  }
  return cleaned;
}

const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
if (rawDbUrl) {
  process.env.DATABASE_URL = sanitizeDatabaseUrl(rawDbUrl);
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

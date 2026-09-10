const { execSync } = require('child_process');

function sanitizeDatabaseUrl(url) {
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

const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
if (rawUrl) {
  const sanitized = sanitizeDatabaseUrl(rawUrl);
  if (sanitized) {
    process.env.DATABASE_URL = sanitized;
  }
}

try {
  console.log('🔄 Syncing database schema...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });
  console.log('🌱 Seeding database data...');
  execSync('npx ts-node --transpile-only prisma/seed.ts', { stdio: 'inherit', env: process.env });
  console.log('✅ Database setup complete!');
} catch (err) {
  console.warn('⚠️ Database sync skipped/failed during build:', err.message);
}

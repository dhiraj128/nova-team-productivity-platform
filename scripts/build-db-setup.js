const { execSync } = require('child_process');

try {
  console.log('🔄 Syncing database schema...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('🌱 Seeding database data...');
  execSync('npx ts-node --transpile-only prisma/seed.ts', { stdio: 'inherit' });
  console.log('✅ Database setup complete!');
} catch (err) {
  console.warn('⚠️ Database sync skipped/failed during build:', err.message);
}

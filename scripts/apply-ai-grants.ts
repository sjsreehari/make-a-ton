import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Connecting to database...');
    await prisma.$connect();

    // 1. Apply AI Views
    const viewsSqlPath = path.join(__dirname, '../prisma/sql/ai_views.sql');
    if (fs.existsSync(viewsSqlPath)) {
      console.log('Applying AI views from prisma/sql/ai_views.sql...');
      const viewsSql = fs.readFileSync(viewsSqlPath, 'utf8');
      const statements = viewsSql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const sql of statements) {
        await prisma.$executeRawUnsafe(sql);
      }
      console.log('AI views applied successfully.');
    }

    // 2. Apply Read-Only Grants
    const readonlySqlPath = path.join(__dirname, '../prisma/sql/ai_readonly.sql');
    if (fs.existsSync(readonlySqlPath)) {
      console.log('Applying AI read-only grants from prisma/sql/ai_readonly.sql...');
      const readonlySql = fs.readFileSync(readonlySqlPath, 'utf8');
      const statements = readonlySql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const sql of statements) {
        try {
          await prisma.$executeRawUnsafe(sql);
        } catch (grantErr: any) {
          console.warn(`Grant notice: ${grantErr.message}`);
        }
      }
      console.log('AI grants processed.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Failed to apply AI grants:', err);
  process.exit(1);
});
